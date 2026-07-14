import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '../../../../libs/database/src/postgresql/postgresql.module';
import { BasePostgresRepository } from '../../../../libs/database/src/postgresql/repository/base.repository';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { featureEntity } from './entities/feature.entity';

@Injectable()
export class FeatureRepository extends BasePostgresRepository<typeof featureEntity> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, featureEntity);
  }
}
