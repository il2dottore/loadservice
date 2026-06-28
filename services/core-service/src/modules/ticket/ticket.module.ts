import { Module } from '@nestjs/common';
import { PostgresDatabaseModule } from '@databases/postgresql/postgresql.module';
import { TicketController } from './ticket.controller';
import { TicketRepository } from './ticket.repository';
import { TicketService } from './services/ticket.service';

@Module({
  imports: [PostgresDatabaseModule],
  controllers: [TicketController],
  providers: [TicketService, TicketRepository],
  exports: [TicketService]
})
export class TicketModule {}
