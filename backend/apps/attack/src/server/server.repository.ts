import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { eq, inArray, isNull, or } from 'drizzle-orm';
import { networkEntity } from '../entities/network.entity';
import { serverEntity } from '../entities/server.entity';
import { networkServerEntity } from '../entities/network-server.entity';
import { BasePostgresRepository } from '@app/database/postgresql/repository/base.repository';
import { POSTGRES } from '@app/database/postgresql/postgresql.module';
import { networksFeaturesTable } from '../entities/network-feature.entity';

@Injectable()
export class ServerRepository extends BasePostgresRepository<
  typeof serverEntity
> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, serverEntity);
  }

  async queryServersInfo() {
    return await this.postgres
      .select()
      .from(this.table)
      .leftJoin(
        networkServerEntity,
        eq(networkServerEntity.serverId, this.table.id),
      )
      .leftJoin(
        networkEntity,
        eq(networkEntity.id, networkServerEntity.networkId),
      );
  }

  async queryServerInfo(id: number) {
    return await this.postgres
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .leftJoin(
        networkServerEntity,
        eq(networkServerEntity.serverId, this.table.id),
      )
      .leftJoin(
        networkEntity,
        eq(networkEntity.id, networkServerEntity.networkId),
      );
  }

  // This function query all usable servers inside networks based on feature IDs.
  async queryAllowedServers(featureIds: string[]) {
    return this.postgres
      .selectDistinct({
        id: serverEntity.id,
        address: serverEntity.address,
        slots: serverEntity.slots,
      })
      .from(this.table)
      .innerJoin(
        networkServerEntity,
        eq(networkServerEntity.serverId, serverEntity.id),
      )
      .leftJoin(
        networksFeaturesTable,
        eq(networksFeaturesTable.networkId, networkServerEntity.networkId),
      )
      .where(
        or(
          isNull(networksFeaturesTable.featureId),
          inArray(networksFeaturesTable.featureId, featureIds),
        ),
      );
  }
}
