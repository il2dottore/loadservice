import { Module } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '@app/redis/redis.module';
import { JwtAuthGuard, ResourceOwnerGuard } from '@app/auth';
import { UserModule } from './user/user.module';

@Module({
  providers: [AuthService, JwtAuthGuard, ResourceOwnerGuard],
  imports: [
    RedisModule,
    UserModule,
    JwtModule.register({
      global: true,
      secret: 'sussybakadeptrai',
    }),
  ],
  controllers: [AuthController],
})
export class AuthModule { }
