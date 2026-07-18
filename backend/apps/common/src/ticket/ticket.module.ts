import { Module } from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { TicketRepository } from './ticket.repository';
import { TicketService } from './services/ticket.service';
import { ticketReplyEntity } from './schemas/ticket-reply.entity';
import { UserModule } from '../auth/src/user/user.module';
import { TicketGateway } from './ticket.gateway';

@Module({
  imports: [UserModule],
  controllers: [TicketController],
  providers: [TicketService, TicketRepository, TicketGateway],
  exports: [TicketService],
})
export class TicketModule {}
