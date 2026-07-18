import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName!: string;

  @IsString()
  @IsOptional()
  lastName!: string;

  @IsString()
  @IsOptional()
  username!: string;

  @IsString()
  @IsOptional()
  email!: string;

  @IsBoolean()
  @IsOptional()
  emailVerified!: boolean;

  @IsDate()
  @IsOptional()
  createdAt!: Date;

  @IsDate()
  @IsOptional()
  updatedAt!: Date;
}
