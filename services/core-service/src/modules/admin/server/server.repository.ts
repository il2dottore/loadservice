import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '@databases/postgresql/postgresql.provider';
import { BasePostgresRepository } from '@databases/postgresql/repository/base.repository';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { eq } from 'drizzle-orm';
import { networksTable } from '@modules/admin/network/schemas/network.schema';
import { serversTable } from './schemas/server.schema';

@Injectable()
export class ServerRepository extends BasePostgresRepository<typeof serversTable> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, serversTable);
  }

  async queryServerInfo(id: number) {
    return await this.postgres
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .leftJoin(networksTable, eq(networksTable.id, this.table.networkId));
  }
}
