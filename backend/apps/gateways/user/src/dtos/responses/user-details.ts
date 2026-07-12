import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Feature } from '../../../../admin/feature/src/schemas/feature.schema';
import { Plan } from '../../../../admin/plan/src/schemas/plan.schema';
import { Role } from '../../../../admin/role/src/schemas/role.schema';
import { User } from '../../schemas/user.schema';

export class UserResponse implements Omit<User, 'password'> {
  @ApiProperty({ type: String, format: 'uuid', description: 'User ID' })
  @Expose()
  id!: User['id'];

  @ApiProperty({ type: String })
  @Expose()
  firstName!: User['firstName'];

  @ApiProperty({ type: String })
  @Expose()
  lastName!: User['lastName'];

  @ApiProperty({ type: String })
  @Expose()
  username!: User['username'];

  @ApiProperty({ type: String, nullable: true })
  @Expose()
  phoneNumber!: User['phoneNumber'];

  @ApiProperty({ type: String })
  @Expose()
  email!: User['email'];

  @ApiProperty({ type: Boolean })
  @Expose()
  emailVerified!: User['emailVerified'];

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  createdAt!: User['createdAt'];

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  updatedAt!: User['updatedAt'];
}

class UserRoleDetails {
  @ApiProperty({ type: Number })
  @Expose()
  id!: Role['id'];

  @ApiProperty({ type: String })
  @Expose()
  name!: Role['name'];
}

class UserPermissionDetails {
  @ApiProperty({ type: String })
  @Expose()
  permission_id!: string;
}

class UserPlanFeatureDetails implements Feature {
  @ApiProperty({ type: String })
  @Expose()
  id!: Feature['id'];

  @ApiProperty({ type: String })
  @Expose()
  name!: Feature['name'];

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  createdAt!: Feature['createdAt'];

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  updatedAt!: Feature['updatedAt'];
}

class UserPlanDetails implements Plan {
  @ApiProperty({ type: Number })
  @Expose()
  id!: Plan['id'];

  @ApiProperty({ type: String })
  @Expose()
  name!: Plan['name'];

  @ApiProperty({ type: Number })
  @Expose()
  price!: Plan['price'];

  @ApiProperty({ type: Number })
  @Expose()
  maxDuration!: Plan['maxDuration'];

  @ApiProperty({ type: Number })
  @Expose()
  maxConcurrents!: Plan['maxConcurrents'];

  @ApiProperty({ type: Boolean })
  @Expose()
  isCustom!: Plan['isCustom'];

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  createdAt!: Plan['createdAt'];

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  updatedAt!: Plan['updatedAt'];

  @ApiProperty({ type: UserPlanFeatureDetails, isArray: true })
  @Expose()
  @Type(() => UserPlanFeatureDetails)
  plan_features!: UserPlanFeatureDetails[];
}

export class UserDetails {
  @ApiProperty({ type: UserResponse })
  @Expose()
  @Type(() => UserResponse)
  user!: UserResponse;

  @ApiProperty({ type: UserRoleDetails, isArray: true })
  @Expose()
  @Type(() => UserRoleDetails)
  roles!: UserRoleDetails[];

  @ApiProperty({ type: UserPermissionDetails, isArray: true })
  @Expose()
  @Type(() => UserPermissionDetails)
  roles_permissions!: UserPermissionDetails[];

  @ApiProperty({ type: UserPlanDetails, isArray: true })
  @Expose()
  @Type(() => UserPlanDetails)
  plans!: UserPlanDetails[];
}
