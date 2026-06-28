import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '@databases/postgresql/postgresql.provider';
import { BasePostgresRepository } from '@databases/postgresql/repository/base.repository';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { ticketsTable } from './schemas/ticket.schema';

@Injectable()
export class TicketRepository extends BasePostgresRepository<typeof ticketsTable> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, ticketsTable);
  }
}
