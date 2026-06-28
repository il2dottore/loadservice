import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateServerDto {
  @IsString()
  @IsOptional()
  name!: string;

  @IsString()
  @IsOptional()
  address!: string;

  @IsInt()
  @IsOptional()
  networkId!: number;
}
