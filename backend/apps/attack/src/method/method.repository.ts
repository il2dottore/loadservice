import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { methodsTable } from '../entities/method.entity';
import { POSTGRES } from '@app/database/postgresql/postgresql.provider';
import { BasePostgresRepository } from '@app/database/postgresql/repository/base.repository';

@Injectable()
export class MethodRepository extends BasePostgresRepository<typeof methodsTable> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, methodsTable);
  }
}
