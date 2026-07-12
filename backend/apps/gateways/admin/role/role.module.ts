import { Module } from '@nestjs/common';
import { RoleService } from './services/role.service';
import { RoleController } from './role.controller';
import { RoleRepository } from './role.repository';
import { PostgresDatabaseModule } from '@app/database/postgresql/postgresql.module';

@Module({
  imports: [
    PostgresDatabaseModule.forService(),
  ],
  providers: [RoleService, RoleRepository],
  controllers: [RoleController],
  exports: [RoleService]
})
export class RoleModule { }
