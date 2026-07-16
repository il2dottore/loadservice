import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '../../../../libs/database/src/postgresql/postgresql.module';
import { BasePostgresRepository } from '../../../../libs/database/src/postgresql/repository/base.repository';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { and, eq, inArray } from 'drizzle-orm';
import { featureEntity } from '../../feature/src/entities/feature.entity';
import { planEntity } from './entities/plan.entity';
import { planFeatureEntity } from './entities/plan-feature.entity';

@Injectable()
export class PlanRepository extends BasePostgresRepository<typeof planEntity> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, planEntity);
  }

  async queryPlanInfo(id: number) {
    return await this.postgres
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .leftJoin(planFeatureEntity, eq(planFeatureEntity.planId, this.table.id))
      .leftJoin(featureEntity, eq(featureEntity.id, planFeatureEntity.featureId));
  }

  async queryPlansInfo(ids: number[]) {
    return await this.postgres.select().from(this.table)
      .where(inArray(this.table.id, ids))
      .leftJoin(planFeatureEntity, eq(planFeatureEntity.planId, this.table.id))
      .leftJoin(featureEntity, eq(featureEntity.id, planFeatureEntity.featureId));
  }


  async assignFeature(planId: number, featureId: string) {
    const result = await this.postgres
      .insert(planFeatureEntity)
      .values({ planId, featureId })
      .returning();
    return result[0];
  }

  async removeFeature(planId: number, featureId: string) {
    const result = await this.postgres
      .delete(planFeatureEntity)
      .where(and(
        eq(planFeatureEntity.planId, planId),
        eq(planFeatureEntity.featureId, featureId)
      ))
      .returning();
    return result[0] ?? null;
  }
}
