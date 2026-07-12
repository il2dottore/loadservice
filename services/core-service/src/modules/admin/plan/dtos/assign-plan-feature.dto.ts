import { IsNotEmpty, IsString } from 'class-validator';

export class AssignPlanFeatureDto {
  @IsString()
  @IsNotEmpty()
  featureId!: string;
}
