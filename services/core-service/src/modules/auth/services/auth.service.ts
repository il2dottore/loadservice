import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from '../dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@modules/user/services/user.service';
import { Redis } from 'ioredis';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { REDIS } from '@databases/redis/redis.provider';
import { CreateUserDto } from '@modules/user/dtos/create-user.dto';
import { User } from '@modules/user/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(REDIS) private readonly redis: Redis,
  ) { }

  private sanitizeUser(user: User) {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async login(loginDto: LoginDto) {
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

    const sessionId = randomUUID();
    const payload = { sub: user.id, email: user.email, sessionId };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '3600s' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    const sessionKey = `session:${user.id}:${sessionId}`;
    await this.redis
      .multi()
      .sadd(`user_sessions:${user.id}`, sessionId)
      .set(sessionKey, refreshToken, 'EX', 604800)
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

  async logout(userId: string, sessionId: string) {
    if (!userId || !sessionId) {
      throw new BadRequestException('userId and sessionId are required');
    }

    await this.redis
      .multi()
      .srem(`user_sessions:${userId}`, sessionId)
      .del(`session:${userId}:${sessionId}`)
      .exec();
  }

  async logoutAll(userId: string) {
    const sessionIds = await this.redis.smembers(`user_sessions:${userId}`);
    if (sessionIds.length === 0) return;

    const sessionKeys = sessionIds.map((sid) => `session:${userId}:${sid}`);
    await this.redis
      .multi()
      .del(sessionKeys)
      .del(`user_sessions:${userId}`)
      .exec();
  }

  async listSessions(userId: string) {
    const sessionIds = await this.redis.smembers(`user_sessions:${userId}`);
    const sessions = await Promise.all(
      sessionIds.map(async (sid) => {
        const token = await this.redis.get(`session:${userId}:${sid}`);
        return token ? { sessionId: sid } : null;
      }),
    );
    return sessions.filter(Boolean);
  }
}
