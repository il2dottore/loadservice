import { Module } from '@nestjs/common';
import { PostgresDatabaseModule } from '../../../../libs/database/src/postgresql/postgresql.module';
import { RoleService } from './services/role.service';
import { RoleController } from './role.controller';
import { RoleRepository } from './role.repository';

@Module({
  imports: [PostgresDatabaseModule],
  providers: [RoleService, RoleRepository],
  controllers: [RoleController],
  exports: [RoleService]
})
export class RoleModule { }
