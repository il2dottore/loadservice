import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

// Create CreateUserDto based on usersTable atributes: services/darkservice-service/src/modules/user/schemas/user.schema.ts

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsOptional()
  phoneNumber!: string;

  @IsString()
  @IsNotEmpty()
  email!: string;
}
