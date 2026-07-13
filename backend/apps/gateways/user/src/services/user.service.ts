import { Injectable } from '@nestjs/common';
import { User } from '../schemas/user.schema';
import { UserRepository } from '../user.repository';
import { CreateUserDto } from '../dtos/requests/create-user.dto';
import { UpdateUserDto } from '../dtos/requests/update-user.dto';
import { UserDetails } from '../dtos/responses/user-details';
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserDetailsById(id: string) {
    const rows = await this.userRepository.queryUserDetails(id);

    if (!rows.length) {
      throw new Error('User details not found');
    }

    const { password, ...user } = rows[0].users;
    const userDetails = new UserDetails();
    userDetails.user = user;
    userDetails.roles = [];
    userDetails.roles_permissions = [];
    userDetails.plans = [];

    for (const row of rows) {
      if (
        row.roles &&
        !userDetails.roles.find((role) => role.id === row.roles!.id)
      ) {
        userDetails.roles.push({
          id: row.roles.id,
          name: row.roles.name,
        });
      }

      if (
        row.roles_permissions &&
        !userDetails.roles_permissions.find(
          (permission) =>
            permission.permission_id === row.roles_permissions!.permissionId,
        )
      ) {
        userDetails.roles_permissions.push({
          permission_id: row.roles_permissions.permissionId,
        });
      }

      if (row.plans) {
        let plan = userDetails.plans.find(
          (currentPlan) => currentPlan.id === row.plans!.id,
        );

        if (!plan) {
          plan = {
            ...row.plans,
            plan_features: [],
          };
          userDetails.plans.push(plan);
        }

        if (
          row.features &&
          !plan.plan_features.some((feature) => feature.id === row.features!.id)
        ) {
          plan.plan_features.push(row.features);
        }
      }
    }

    return userDetails;
  }

  async getAllUsersDetails(perPage: number, page: number) {
    const users = await this.getAll(perPage, page);
    const usersDetails = await Promise.all(
      users.map((user) => this.getUserDetailsById(user.id)),
    );

    return usersDetails.filter((user) => user !== null);
  }

  async countAll() {
    const totalUsers = await this.userRepository.countAll();
    return totalUsers;
  }

  async getById(id: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ id: id });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async getAll(perPage: number, page: number): Promise<User[]> {
    const users = await this.userRepository.find(
      {},
      {
        perPage,
        page,
      },
    );
    return users;
  }

  async findOneByUsername(username: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ username: username });
    return user;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ email: email });
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.createWithDefaultAccess({
      ...createUserDto,
      password: await argon2.hash(createUserDto.password),
      emailVerified: createUserDto.emailVerified ?? false,
    });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    const user = await this.userRepository.updateOne({ id: id }, updateUserDto);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async delete(id: string): Promise<User | null> {
    const user = await this.userRepository.deleteOne({ id: id });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async assignRole(userId: string, roleId: number) {
    return await this.userRepository.assignRole(userId, roleId);
  }

  async removeRole(userId: string, roleId: number) {
    return await this.userRepository.removeRole(userId, roleId);
  }
}
