import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '@databases/postgresql/postgresql.provider';
import { BasePostgresRepository } from '@databases/postgresql/repository/base.repository';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { and, eq } from 'drizzle-orm';
import { featuresTable } from '@modules/admin/feature/schemas/feature.schema';
import { networksFeaturesTable, networksTable } from './schemas/network.schema';

@Injectable()
export class NetworkRepository extends BasePostgresRepository<typeof networksTable> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, networksTable);
  }

  async queryNetworkInfo(id: number) {
    return await this.postgres
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .leftJoin(networksFeaturesTable, eq(networksFeaturesTable.networkId, this.table.id))
      .leftJoin(featuresTable, eq(featuresTable.id, networksFeaturesTable.featureId));
  }

  async assignFeature(networkId: number, featureId: number) {
    const result = await this.postgres
      .insert(networksFeaturesTable)
      .values({ networkId, featureId })
      .returning();
    return result[0];
  }

  async removeFeature(networkId: number, featureId: number) {
    const result = await this.postgres
      .delete(networksFeaturesTable)
      .where(and(
        eq(networksFeaturesTable.networkId, networkId),
        eq(networksFeaturesTable.featureId, featureId)
      ))
      .returning();
    return result[0] ?? null;
  }
}
