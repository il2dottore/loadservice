import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PostgresDatabaseModule } from '@databases/postgresql/postgresql.module';
import { UserModule } from '@modules/user/user.module';
import { RedisDatabaseModule } from '@databases/redis/redis.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ResourceOwnerGuard } from '../../common/guards/resource-owner.guard';

@Module({
  providers: [AuthService, JwtAuthGuard, ResourceOwnerGuard],
  imports: [
    PostgresDatabaseModule,
    RedisDatabaseModule,
    UserModule,
    JwtModule.register({
      global: true,
      secret: 'sussybakadeptrai',
    }),
  ],
  controllers: [AuthController],
})
export class AuthModule { }
