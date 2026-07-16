import { Module } from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { TicketRepository } from './ticket.repository';
import { TicketService } from './services/ticket.service';

@Module({
  imports: [],
  controllers: [TicketController],
  providers: [TicketService, TicketRepository],
  exports: [TicketService]
})
export class TicketModule { }
