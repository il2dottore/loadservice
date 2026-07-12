import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '@app/redis/redis.module';
import { JwtAuthGuard, ResourceOwnerGuard } from '@app/auth';

@Module({
  providers: [AuthService, JwtAuthGuard, ResourceOwnerGuard],
  imports: [
    RedisModule,
    JwtModule.register({
      global: true,
      secret: 'sussybakadeptrai',
    }),
  ],
  controllers: [AuthController],
})
export class AuthModule { }
