import type { TicketStatusValue } from '../schemas/ticket.entity';
import { IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
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
