import type { OsiLayerValue } from '../../entities/method.entity';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateMethodDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsIn(['LAYER_4', 'LAYER_7'])
  osiLayer!: OsiLayerValue;
}
