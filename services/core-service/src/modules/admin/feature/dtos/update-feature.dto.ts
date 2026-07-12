import { IsOptional, IsString } from 'class-validator';

export class UpdateFeatureDto {
  @IsString()
  @IsOptional()
  id!: string;

  @IsString()
  @IsOptional()
  name!: string;
}
