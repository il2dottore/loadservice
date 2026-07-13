import { Module } from '@nestjs/common';
import { PostgresDatabaseModule } from '@app/database/postgresql/postgresql.module';
import { RoleController } from './role.controller';
import { RoleRepository } from './role.repository';
import { RoleService } from './role.service';

@Module({
  imports: [PostgresDatabaseModule.forService()],
  providers: [RoleService, RoleRepository],
  controllers: [RoleController],
  exports: [RoleService],
})
export class RoleModule { }
