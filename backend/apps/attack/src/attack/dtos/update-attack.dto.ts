import { IsBoolean, IsInt, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateAttackDto {
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

  @IsBoolean()
  @IsOptional()
  isStopped!: boolean;

  @IsObject()
  @IsOptional()
  options!: Record<string, unknown>;
}
