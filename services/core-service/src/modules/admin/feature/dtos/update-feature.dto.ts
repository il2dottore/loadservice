import { IsOptional, IsString } from 'class-validator';

export class UpdateFeatureDto {
  @IsString()
  @IsOptional()
  code!: string;
}
