import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '../../../../../libs/database/src/postgresql/postgresql.module';
import { BasePostgresRepository } from '../../../../../libs/database/src/postgresql/repository/base.repository';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { permissionEntity } from '../entities/permission.entity';

@Injectable()
export class PermissionRepository extends BasePostgresRepository<typeof permissionEntity> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, permissionEntity);
  }
}
