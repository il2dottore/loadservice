import { Module } from '@nestjs/common';
import { PostgresDatabaseModule } from '@databases/postgresql/postgresql.module';
import { PermissionController } from './permission.controller';
import { PermissionRepository } from './permission.repository';
import { PermissionService } from './services/permission.service';

@Module({
  imports: [PostgresDatabaseModule],
  controllers: [PermissionController],
  providers: [PermissionService, PermissionRepository],
  exports: [PermissionService]
})
export class PermissionModule {}
