import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from './dtos/requests/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { createHash, randomUUID } from 'crypto';
import { CreateUserDto } from '../user/dtos/requests/create-user.dto';
import { UpdateUserDto } from '../user/dtos/requests/update-user.dto';
import { SessionResponse } from './dtos/responses/session-response';
import { RedisService } from '@app/redis/redis.service';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
  ) { }

  private sanitizeUser(user: User) {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  private parseUserAgent(ua: string): string {
    const u = ua.toLowerCase();
    if (u.includes('iphone')) return 'iPhone';
    if (u.includes('ipad')) return 'iPad';
    if (u.includes('android')) return 'Android';
    if (u.includes('mac')) return 'Mac';
    if (u.includes('windows')) return 'Windows PC';
    if (u.includes('linux')) return 'Linux';
    return 'Unknown device';
  }

  private getDeviceKind(deviceName: string): string {
    const d = deviceName.toLowerCase();
    if (d.includes('iphone') || d.includes('android')) return 'mobile';
    if (d.includes('ipad')) return 'tablet';
    return 'desktop';
  }

  async login(loginDto: LoginDto, deviceInfo?: { ipAddress?: string; userAgent?: string }) {
    const identifier = loginDto.username.trim();
    const user = identifier.includes('@')
      ? await this.userService.findOneByEmail(identifier)
      : await this.userService.findOneByUsername(identifier);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await argon2.verify(user.password, loginDto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return this.issueSession(user, deviceInfo);
  }

  async register(createUserDto: CreateUserDto) {
    const existingUsername = await this.userService.findOneByUsername(createUserDto.username);
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    const existingEmail = await this.userService.findOneByEmail(createUserDto.email);
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.userService.create(createUserDto);

    return this.login({
      username: user.username,
      password: createUserDto.password
    });
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<{ sub: string; sessionId: string }>(refreshToken);
      if (!payload.sub || !payload.sessionId) throw new UnauthorizedException('Invalid refresh token');

      const sessionKey = `session:${payload.sub}:${payload.sessionId}`;
      const sessionData = await this.redis.getJson<SessionData>(sessionKey);
      const stored = sessionData;
      if (!stored) throw new UnauthorizedException('Session has expired');

      const tokenHash = this.hashToken(refreshToken);
      if (stored.refreshTokenHash !== tokenHash) {
        throw new UnauthorizedException('Refresh token revoked or already used');
      }

      const user = await this.userService.getById(payload.sub);
      if (!user) throw new UnauthorizedException('User no longer exists');

      return this.issueSession(user, {
        ipAddress: stored.ipAddress,
        userAgent: stored.userAgent,
      }, payload.sessionId, stored);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async getProfile(userId: string) {
    const details = await this.userService.getUserDetailsById(userId);
    return {
      ...details.user,
      roles: details.roles,
      permissions: details.roles_permissions.map(({ permission_id }) => permission_id),
      plans: details.plans.map(({ plan_features, ...plan }) => ({
        ...plan,
        planFeatures: plan_features,
      })),
    };
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    await this.userService.update(userId, updateUserDto);
    return this.getProfile(userId);
  }

  async logout(userId: string, sessionId: string) {
    if (!userId || !sessionId) {
      throw new BadRequestException('userId and sessionId are required');
    }

    await this.redis
      .multi()
      // Xoá sessionID trong user_sessions
      .srem(`user_sessions:${userId}`, sessionId)
      // Xoá thông tin của sessionID (Là refresh token)
      .del(`session:${userId}:${sessionId}`)
      .exec();
  }

  async logoutAll(userId: string, excludeSessionId?: string) {
    let sessionIds = await this.redis.smembers(`user_sessions:${userId}`);
    if (sessionIds.length === 0) return;

    if (excludeSessionId) {
      sessionIds = sessionIds.filter((sid) => sid !== excludeSessionId);
    }

    if (sessionIds.length === 0) return;

    const sessionKeys = sessionIds.map((sid) => `session:${userId}:${sid}`);
    const pipeline = this.redis.multi();
    pipeline.del(sessionKeys);
    for (const sid of sessionIds) {
      pipeline.srem(`user_sessions:${userId}`, sid);
    }
    await pipeline.exec();
  }

  async listSessions(userId: string): Promise<SessionResponse[]> {
    const sessionIds = await this.redis.smembers(`user_sessions:${userId}`);
    const sessions = await Promise.all(
      sessionIds.map(async (sid) => {
        const stored = await this.redis.get(`session:${userId}:${sid}`);
        if (!stored) return null;
        try {
          const data = JSON.parse(stored);
          return plainToInstance(SessionResponse, {
            sessionId: sid,
            ipAddress: data.ipAddress || '',
            userAgent: data.userAgent || '',
            deviceName: data.deviceName || 'Unknown device',
            deviceKind: data.deviceKind || 'desktop',
            createdAt: data.createdAt || '',
            lastActive: data.lastActive || data.createdAt || '',
          });
        } catch {
          return plainToInstance(SessionResponse, {
            sessionId: sid,
            ipAddress: '',
            userAgent: '',
            deviceName: 'Unknown device',
            deviceKind: 'desktop',
            createdAt: '',
            lastActive: '',
          });
        }
      }),
    );
    return sessions.filter(Boolean) as SessionResponse[];
  }
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async issueSession(
    user: User,
    deviceInfo?: { ipAddress?: string; userAgent?: string },
    sessionId: string = randomUUID(),
    existingSession?: SessionData,
  ) {
    const userDetails = await this.userService.getUserDetailsById(user.id);
    const payload = { sub: user.id, details: userDetails, sessionId };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn') as any,
    });

    const now = new Date().toISOString();
    const deviceName = deviceInfo?.userAgent
      ? this.parseUserAgent(deviceInfo.userAgent)
      : existingSession?.deviceName || 'Unknown device';
    const sessionData: SessionData = {
      refreshTokenHash: this.hashToken(refreshToken),
      ipAddress: deviceInfo?.ipAddress ?? existingSession?.ipAddress ?? '',
      userAgent: deviceInfo?.userAgent ?? existingSession?.userAgent ?? '',
      deviceName,
      deviceKind: this.getDeviceKind(deviceName),
      createdAt: existingSession?.createdAt ?? now,
      lastActive: now,
    };

    const sessionKey = `session:${user.id}:${sessionId}`;
    const ttl = this.refreshTtlSeconds();
    await this.redis.multi()
      .sadd(`user_sessions:${user.id}`, sessionId)
      .set(sessionKey, JSON.stringify(sessionData), 'EX', ttl)
      .exec();

    return { user: this.sanitizeUser(user), accessToken, refreshToken, sessionId };
  }

  private refreshTtlSeconds(): number {
    const value = this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d';
    const match = /^(\d+)([smhd])$/.exec(value);
    if (!match) return 604800;
    const units = { s: 1, m: 60, h: 3600, d: 86400 } as const;
    return Number(match[1]) * units[match[2] as keyof typeof units];
  }
}

interface SessionData {
  refreshTokenHash: string;
  ipAddress: string;
  userAgent: string;
  deviceName: string;
  deviceKind: string;
  createdAt: string;
  lastActive: string;
}
