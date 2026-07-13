import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { and, eq } from 'drizzle-orm';
import { networkEntity } from '../entities/network.entity';
import { networkServerEntity } from '../entities/network-server.entity';
import { serverEntity } from '../entities/server.entity';
import { POSTGRES } from '@app/database/postgresql/postgresql.provider';
import { BasePostgresRepository } from '@app/database/postgresql/repository/base.repository';

@Injectable()
export class NetworkRepository extends BasePostgresRepository<typeof networkEntity> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, networkEntity);
  }

  async queryNetworkInfo(id: number) {
    return await this.postgres
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .leftJoin(networkServerEntity, eq(networkServerEntity.networkId, this.table.id))
      .leftJoin(serverEntity, eq(serverEntity.id, networkServerEntity.serverId));
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
      .where(and(
        eq(networkServerEntity.networkId, networkId),
        eq(networkServerEntity.serverId, serverId),
      ))
      .returning();
    return result[0] ?? null;
  }
}
