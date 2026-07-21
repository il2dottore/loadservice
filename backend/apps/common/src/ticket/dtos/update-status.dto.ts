import { IsIn } from 'class-validator';
import type { TicketStatusValue } from '../../entities/ticket.entity';

export class UpdateStatusDto {
  @IsIn(['OPEN', 'IN_PROGRESS', 'SOLVED', 'CLOSED'])
  status!: TicketStatusValue;
}
