import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './services/user.service';
import { PostgresDatabaseModule } from '../../../libs/database/src/postgresql/postgresql.module';
import { UserRepository } from './user.repository';
import { JwtAuthGuard } from '../../../libs/auth/src/guards/jwt-auth.guard';
import { ResourceOwnerGuard } from '../../../libs/auth/src/guards/resource-owner.guard';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, JwtAuthGuard, ResourceOwnerGuard],
  imports: [
    PostgresDatabaseModule.forService(),
  ],
  exports: [UserService]
})
export class UserModule { }
