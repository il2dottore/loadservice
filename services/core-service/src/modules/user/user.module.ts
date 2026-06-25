import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './services/user.service';
import { PostgresDatabaseModule } from '@databases/postgresql/postgresql.module';
import { UserRepository } from './user.repository';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository],
  imports: [PostgresDatabaseModule],
})
export class UserModule {}
