import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateServerDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsInt()
  @Min(1)
  slots!: number;
}
