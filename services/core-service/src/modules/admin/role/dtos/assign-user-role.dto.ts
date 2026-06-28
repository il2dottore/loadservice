import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignUserRoleDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;
}
