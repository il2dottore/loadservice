import { IsOptional, IsString } from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  key!: string;

  @IsString()
  @IsOptional()
  displayName!: string;

  @IsString()
  @IsOptional()
  description!: string;
}
