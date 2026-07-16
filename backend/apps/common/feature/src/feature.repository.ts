import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '../../../../libs/database/src/postgresql/postgresql.module';
import { BasePostgresRepository } from '../../../../libs/database/src/postgresql/repository/base.repository';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { featureEntity } from './entities/feature.entity';
import { planFeatureEntity } from '../../plan/src/entities/plan-feature.entity';
import { eq } from 'drizzle-orm';

@Injectable()
export class FeatureRepository extends BasePostgresRepository<typeof featureEntity> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, featureEntity);
  }

  async deleteWithAssignments(id: string) {
    await this.postgres
      .delete(planFeatureEntity)
      .where(eq(planFeatureEntity.featureId, id));
    return this.deleteOne({ id });
  }
}
