import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateNetworkDto {
  @IsString()
  @IsOptional()
  name!: string;

  @IsBoolean()
  @IsOptional()
  vipAccess!: boolean;
}
