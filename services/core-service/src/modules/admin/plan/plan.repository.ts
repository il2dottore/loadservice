import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '@databases/postgresql/postgresql.provider';
import { BasePostgresRepository } from '@databases/postgresql/repository/base.repository';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { eq } from 'drizzle-orm';
import { featuresTable, plansFeaturesTable } from '@modules/admin/feature/schemas/feature.schema';
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
}
