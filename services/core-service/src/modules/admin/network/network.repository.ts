import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '@databases/postgresql/postgresql.provider';
import { BasePostgresRepository } from '@databases/postgresql/repository/base.repository';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { and, eq } from 'drizzle-orm';
import { serversTable } from '@modules/admin/server/schemas/server.schema';
import { networksServersTable, networksTable } from './schemas/network.schema';

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
      .leftJoin(networksServersTable, eq(networksServersTable.networkId, this.table.id))
      .leftJoin(serversTable, eq(serversTable.id, networksServersTable.serverId));
  }

  async assignServer(networkId: number, serverId: number) {
    const result = await this.postgres
      .insert(networksServersTable)
      .values({ networkId, serverId })
      .returning();
    return result[0];
  }

  async removeServer(networkId: number, serverId: number) {
    const result = await this.postgres
      .delete(networksServersTable)
      .where(and(
        eq(networksServersTable.networkId, networkId),
        eq(networksServersTable.serverId, serverId),
      ))
      .returning();
    return result[0] ?? null;
  }
}
