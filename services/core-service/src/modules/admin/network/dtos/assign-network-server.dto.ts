import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class AssignNetworkServerDto {
  @IsInt()
  @Type(() => Number)
  serverId!: number;
}
