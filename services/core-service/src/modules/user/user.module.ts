import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './services/user.service';
import { PostgresDatabaseModule } from '@databases/postgresql/postgresql.module';
import { UserRepository } from './user.repository';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { ResourceOwnerGuard } from '../../common/guards/resource-owner.guard';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, JwtAuthGuard, ResourceOwnerGuard],
  imports: [PostgresDatabaseModule],
  exports: [UserService]
})
export class UserModule {}
