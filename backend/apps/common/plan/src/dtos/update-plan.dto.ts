import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdatePlanDto {
  @IsString()
  @IsOptional()
  name!: string;

  @IsInt()
  @IsOptional()
  price!: number;

  @IsInt()
  @IsOptional()
  maxDuration!: number;

  @IsInt()
  @IsOptional()
  maxConcurrents!: number;

  @IsBoolean()
  @IsOptional()
  isCustom!: boolean;
}
