import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

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

  @ApiProperty({ example: 30, required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  days?: number;

  @IsInt()
  @IsOptional()
  maxConcurrents!: number;

  @IsBoolean()
  @IsOptional()
  isCustom!: boolean;
}
