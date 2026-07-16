import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { methodsFeaturesTable } from '../entities/method.entity';
import { POSTGRES } from '@app/database/postgresql/postgresql.module';

@Injectable()
export class EntitlementService {
  constructor(@Inject(POSTGRES) private readonly attackDb: PostgresJsDatabase) { }

  async getMissingMethodFeatures(methodId: number, authorization: string) {
    const required = await this.attackDb
      .select({ featureId: methodsFeaturesTable.featureId })
      .from(methodsFeaturesTable)
      .where(eq(methodsFeaturesTable.methodId, methodId));
    const response = await fetch(
      `${process.env.COMMON_SERVICE_URL ?? 'http://127.0.0.1:3000'}/api/v1/auth/me`,
      { headers: { authorization } },
    );
    if (!response.ok) throw new Error('Unable to verify user plan features');
    const profile = await response.json() as {
      plans?: { planFeatures?: { id: string }[] }[];
    };
    const ownedIds = new Set(
      profile.plans?.flatMap((plan) => plan.planFeatures?.map(({ id }) => id) ?? []) ?? [],
    );
    return required.map(({ featureId }) => featureId).filter((id) => !ownedIds.has(id));
  }
}
