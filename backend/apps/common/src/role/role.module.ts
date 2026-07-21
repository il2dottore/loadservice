import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleRepository } from './role.repository';
import { RoleService } from './role.service';

@Module({
  imports: [],
  providers: [RoleService, RoleRepository],
  controllers: [RoleController],
  exports: [RoleService],
})
export class RoleModule {}
