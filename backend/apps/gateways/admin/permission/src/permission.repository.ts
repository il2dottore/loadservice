import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '../../../../../libs/database/src/postgresql/postgresql.provider';
import { BasePostgresRepository } from '../../../../../libs/database/src/postgresql/repository/base.repository';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { permissionsTable } from './schemas/permission.schema';

@Injectable()
export class PermissionRepository extends BasePostgresRepository<typeof permissionsTable> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, permissionsTable);
  }
}

