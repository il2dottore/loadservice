import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '../../../../libs/database/src/postgresql/postgresql.module';
import { BasePostgresRepository } from '../../../../libs/database/src/postgresql/repository/base.repository';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { ticketsTable } from './schemas/ticket.schema';

@Injectable()
export class TicketRepository extends BasePostgresRepository<typeof ticketsTable> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, ticketsTable);
  }
}
