import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '@app/database/postgresql/postgresql.module';
import { BasePostgresRepository } from '@app/database/postgresql/repository/base.repository';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { permissionEntity } from '../entities/permission.entity';

@Injectable()
export class PermissionRepository extends BasePostgresRepository<typeof permissionEntity> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, permissionEntity);
  }
}
