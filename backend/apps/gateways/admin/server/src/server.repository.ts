import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '../../../../../libs/database/src/postgresql/postgresql.provider';
import { BasePostgresRepository } from '../../../../../libs/database/src/postgresql/repository/base.repository';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { eq } from 'drizzle-orm';
import { networksServersTable, networksTable } from '../../network/src/schemas/network.schema';
import { serversTable } from './schemas/server.schema';

@Injectable()
export class ServerRepository extends BasePostgresRepository<typeof serversTable> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, serversTable);
  }

  async queryServersInfo() {
    return await this.postgres
      .select()
      .from(this.table)
      .leftJoin(networksServersTable, eq(networksServersTable.serverId, this.table.id))
      .leftJoin(networksTable, eq(networksTable.id, networksServersTable.networkId));
  }

  async queryServerInfo(id: number) {
    return await this.postgres
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .leftJoin(networksServersTable, eq(networksServersTable.serverId, this.table.id))
      .leftJoin(networksTable, eq(networksTable.id, networksServersTable.networkId));
  }
}
