import { IsOptional, IsString } from 'class-validator';

export class UpdateNetworkDto {
  @IsString()
  @IsOptional()
  name!: string;
}
