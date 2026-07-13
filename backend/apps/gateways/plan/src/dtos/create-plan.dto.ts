import { IsBoolean, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  price!: number;

  @IsInt()
  maxDuration!: number;

  @IsInt()
  maxConcurrents!: number;

  @IsBoolean()
  isCustom!: boolean;
}
