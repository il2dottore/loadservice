import { IsBoolean, IsInt, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

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

  @IsBoolean()
  isStopped!: boolean;

  @IsObject()
  options!: Record<string, unknown>;
}
