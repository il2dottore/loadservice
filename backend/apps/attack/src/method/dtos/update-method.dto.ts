import type { OsiLayerValue } from '../../entities/method.entity';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateMethodDto {
  @IsString()
  @IsOptional()
  name!: string;

  @IsString()
  @IsIn(['LAYER_4', 'LAYER_7'])
  @IsOptional()
  osiLayer!: OsiLayerValue;
}
