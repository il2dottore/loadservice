import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { and, eq, inArray, isNull, or } from 'drizzle-orm';
import { networkEntity } from '../entities/network.entity';
import { networkServerEntity } from '../entities/network-server.entity';
import { serverEntity } from '../entities/server.entity';
import { networksFeaturesTable } from '../entities/network-feature.entity';
import { POSTGRES } from '@app/database/postgresql/postgresql.module';
import { BasePostgresRepository } from '@app/database/postgresql/repository/base.repository';

@Injectable()
export class NetworkRepository extends BasePostgresRepository<
  typeof networkEntity
> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, networkEntity);
  }

  async queryNetworkInfo(id: number) {
    return await this.postgres
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .leftJoin(
        networkServerEntity,
        eq(networkServerEntity.networkId, this.table.id),
      )
      .leftJoin(
        serverEntity,
        eq(serverEntity.id, networkServerEntity.serverId),
      );
  }

  async queryAllowedServers(featureIds: string[]) {
    // Basic server info
    return this.postgres
      .selectDistinct({
        id: serverEntity.id,
        name: serverEntity.name,
        address: serverEntity.address,
        slots: serverEntity.slots,
      })
      .from(serverEntity)
      // From networks_servers
      .innerJoin(
        networkServerEntity,
        eq(networkServerEntity.serverId, serverEntity.id),
      )
      .innerJoin(
        networkEntity,
        eq(networkEntity.id, networkServerEntity.networkId),
      )
      .leftJoin(
        networksFeaturesTable,
        eq(networksFeaturesTable.networkId, networkEntity.id),
      )
      .where(
        or(
          isNull(networksFeaturesTable.featureId),
          inArray(networksFeaturesTable.featureId, featureIds),
        ),
      );
  }

  async queryNetworkFeatures(networkId: number) {
    return this.postgres
      .select()
      .from(networksFeaturesTable)
      .where(eq(networksFeaturesTable.networkId, networkId));
  }

  async assignFeature(networkId: number, featureId: string) {
    const [result] = await this.postgres
      .insert(networksFeaturesTable)
      .values({ networkId, featureId })
      .onConflictDoNothing()
      .returning();
    return result ?? null;
  }

  async removeFeature(networkId: number, featureId: string) {
    const [result] = await this.postgres
      .delete(networksFeaturesTable)
      .where(
        and(
          eq(networksFeaturesTable.networkId, networkId),
          eq(networksFeaturesTable.featureId, featureId),
        ),
      )
      .returning();
    return result ?? null;
  }

  async assignServer(networkId: number, serverId: number) {
    const result = await this.postgres
      .insert(networkServerEntity)
      .values({ networkId, serverId })
      .returning();
    return result[0];
  }

  async removeServer(networkId: number, serverId: number) {
    const result = await this.postgres
      .delete(networkServerEntity)
      .where(
        and(
          eq(networkServerEntity.networkId, networkId),
          eq(networkServerEntity.serverId, serverId),
        ),
      )
      .returning();
    return result[0] ?? null;
  }
}
