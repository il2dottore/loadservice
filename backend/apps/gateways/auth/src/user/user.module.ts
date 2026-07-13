import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { JwtAuthGuard, ResourceOwnerGuard } from '@app/auth';
import { PostgresDatabaseModule } from '@app/database/postgresql/postgresql.module';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, JwtAuthGuard, ResourceOwnerGuard],
  imports: [PostgresDatabaseModule.forService()],
  exports: [UserService],
})
export class UserModule {}
