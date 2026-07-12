import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateNetworkDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsBoolean()
  vipAccess!: boolean;
}
