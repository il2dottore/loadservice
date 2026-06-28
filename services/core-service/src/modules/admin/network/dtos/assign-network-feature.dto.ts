import { IsInt } from 'class-validator';

export class AssignNetworkFeatureDto {
  @IsInt()
  featureId!: number;
}
