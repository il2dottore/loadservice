import { Module } from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { TicketRepository } from './ticket.repository';
import { TicketService } from './services/ticket.service';
import { PostgresDatabaseModule } from '@app/database/postgresql/postgresql.module';

@Module({
  imports: [
    PostgresDatabaseModule.forService(),
  ],
  controllers: [TicketController],
  providers: [TicketService, TicketRepository],
  exports: [TicketService]
})
export class TicketModule { }
