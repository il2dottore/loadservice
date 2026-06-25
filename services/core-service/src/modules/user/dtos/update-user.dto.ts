import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';

// Create UpdateUserDto based on usersTable atributes: services/darkservice-service/src/modules/user/schemas/user.schema.ts

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
  phoneNumber!: string;

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
