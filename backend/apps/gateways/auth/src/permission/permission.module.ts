import { Module } from '@nestjs/common';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { PostgresDatabaseModule } from '@app/database/postgresql/postgresql.module';
import { PermissionRepository } from './permission.repository';

@Module({
  imports: [
    PostgresDatabaseModule.forService(),
  ],
  controllers: [PermissionController],
  providers: [PermissionService, PermissionRepository],
  exports: [PermissionService]
})
export class PermissionModule { }
