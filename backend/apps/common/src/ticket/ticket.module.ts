import { Module } from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { TicketRepository } from './ticket.repository';
import { TicketService } from './services/ticket.service';
import { TicketGateway } from './ticket.gateway';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [TicketController],
  providers: [TicketService, TicketRepository, TicketGateway],
  exports: [TicketService],
})
export class TicketModule {}
