import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateAttackDto {
  @IsString()
  target!: string;

  @IsInt()
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
