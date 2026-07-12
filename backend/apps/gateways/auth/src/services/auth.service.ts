import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from '../dtos/requests/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../../user/services/user.service';
import { Redis } from 'ioredis';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { CreateUserDto } from '../../../user/dtos/requests/create-user.dto';
import { User } from '../../../user/schemas/user.schema';
import { UpdateUserDto } from '../../../user/dtos/requests/update-user.dto';
import { SessionResponse } from '../dtos/responses/session-response';
import { REDIS_CLIENT } from '@app/redis/redis.constants';
import { RedisService } from '@app/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(REDIS_CLIENT) private readonly redis: RedisService,
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

    const userDetails = await this.userService.getUserDetailsById(user.id);

    const sessionId = randomUUID();
    const payload = { sub: user.id, details: userDetails, sessionId };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '3600s' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    const now = new Date().toISOString();
    const deviceName = deviceInfo?.userAgent
      ? this.parseUserAgent(deviceInfo.userAgent)
      : 'Unknown device';

    const sessionData = JSON.stringify({
      refreshToken,
      ipAddress: deviceInfo?.ipAddress || '',
      userAgent: deviceInfo?.userAgent || '',
      deviceName,
      deviceKind: this.getDeviceKind(deviceName),
      createdAt: now,
      lastActive: now,
    });

    const sessionKey = `session:${user.id}:${sessionId}`;
    await this.redis
      .multi()
      .sadd(`user_sessions:${user.id}`, sessionId)
      .set(sessionKey, sessionData, 'EX', 604800)
      .exec();

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
      sessionId
    };
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
      const stored = await this.redis.get(sessionKey);
      if (!stored) throw new UnauthorizedException('Session has expired');

      const sessionData = JSON.parse(stored);
      if (sessionData.refreshToken !== refreshToken) throw new UnauthorizedException('Session has expired');

      // Update lastActive timestamp
      sessionData.lastActive = new Date().toISOString();
      await this.redis.set(sessionKey, JSON.stringify(sessionData), 604800);

      return {
        accessToken: this.jwtService.sign(
          { sub: payload.sub, sessionId: payload.sessionId },
          { expiresIn: '3600s' },
        ),
      };
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
}
