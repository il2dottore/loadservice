import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  price!: number;

  @IsInt()
  maxDuration!: number;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(1)
  days!: number;

  @IsInt()
  maxConcurrents!: number;

  @IsBoolean()
  isCustom!: boolean;
}
