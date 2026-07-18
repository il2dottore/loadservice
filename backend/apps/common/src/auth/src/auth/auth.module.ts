import { Module } from '@nestjs/common';
import { RedisModule } from '@app/redis/redis.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { MailService } from './mail.service';

@Module({
  imports: [
    RedisModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService],
})
export class AuthModule { }
