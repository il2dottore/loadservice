import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export type AttackStatus =
  | 'QUEUED'
  | 'SCHEDULED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'TIMEOUT';

export class UpdateAttackDto {
  @IsOptional()
  @IsIn([
    'QUEUED',
    'SCHEDULED',
    'RUNNING',
    'COMPLETED',
    'FAILED',
    'REJECTED',
    'CANCELLED',
    'TIMEOUT',
  ])
  status?: AttackStatus;
  @IsString()
  @IsOptional()
  target!: string;

  @IsInt()
  @IsOptional()
  duration!: number;

  @IsInt()
  @IsOptional()
  methodId?: number;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsInt()
  @IsOptional()
  serverId?: number;

  @IsInt()
  @Min(1)
  @Max(65535)
  @IsOptional()
  port?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  ppsLimit?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  rateLimit?: number;

  @IsString()
  @IsIn(['GET', 'POST', 'HEAD', 'OPTIONS'])
  @IsOptional()
  requestMethod?: string;

  @IsString()
  @IsOptional()
  postData?: string;
}
