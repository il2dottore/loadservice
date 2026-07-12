import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '../../../../libs/database/src/postgresql/postgresql.provider';
import { BasePostgresRepository } from '../../../../libs/database/src/postgresql/repository/base.repository';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { and, eq } from 'drizzle-orm';
import { featuresTable, plansFeaturesTable } from '../feature/schemas/feature.schema';
import { plansTable } from './schemas/plan.schema';

@Injectable()
export class PlanRepository extends BasePostgresRepository<typeof plansTable> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, plansTable);
  }

  async queryPlanInfo(id: number) {
    return await this.postgres
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .leftJoin(plansFeaturesTable, eq(plansFeaturesTable.planId, this.table.id))
      .leftJoin(featuresTable, eq(featuresTable.id, plansFeaturesTable.featureId));
  }

  async assignFeature(planId: number, featureId: string) {
    const result = await this.postgres
      .insert(plansFeaturesTable)
      .values({ planId, featureId })
      .returning();
    return result[0];
  }

  async removeFeature(planId: number, featureId: string) {
    const result = await this.postgres
      .delete(plansFeaturesTable)
      .where(and(
        eq(plansFeaturesTable.planId, planId),
        eq(plansFeaturesTable.featureId, featureId)
      ))
      .returning();
    return result[0] ?? null;
  }
}
