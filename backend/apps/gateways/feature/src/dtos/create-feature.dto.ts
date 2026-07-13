import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFeatureDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;
}
