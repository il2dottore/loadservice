import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '@app/database/postgresql/postgresql.module';
import { BasePostgresRepository } from '@app/database/postgresql/repository/base.repository';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { ticketEntity } from './schemas/ticket.entity';

@Injectable()
export class TicketRepository extends BasePostgresRepository<typeof ticketEntity> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, ticketEntity);
  }
}
