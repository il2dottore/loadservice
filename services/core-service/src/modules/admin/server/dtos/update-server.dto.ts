import { IsOptional, IsString } from 'class-validator';

export class UpdateServerDto {
  @IsString()
  @IsOptional()
  name!: string;

  @IsString()
  @IsOptional()
  address!: string;
}
