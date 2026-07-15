import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateServerDto {
  @IsString()
  @IsOptional()
  name!: string;

  @IsString()
  @IsOptional()
  address!: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  slots?: number;
}
