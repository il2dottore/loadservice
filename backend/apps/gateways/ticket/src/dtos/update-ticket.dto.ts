import type { TicketStatusValue } from '../schemas/ticket.entity';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateTicketDto {
  @IsString()
  @IsOptional()
  title!: string;

  @IsString()
  @IsOptional()
  content!: string;

  @IsString()
  @IsIn(['OPEN', 'IN_PROGRESS', 'SOLVED'])
  @IsOptional()
  status?: TicketStatusValue;

  @IsUUID()
  @IsOptional()
  senderId?: string;

  @IsUUID()
  @IsOptional()
  assignedSupportId?: string;
}
