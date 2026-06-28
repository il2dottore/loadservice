import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '@databases/postgresql/postgresql.provider';
import { BasePostgresRepository } from '@databases/postgresql/repository/base.repository';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { featuresTable } from '@modules/admin/feature/schemas/feature.schema';

@Injectable()
export class FeatureRepository extends BasePostgresRepository<typeof featuresTable> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, featuresTable);
  }
}
