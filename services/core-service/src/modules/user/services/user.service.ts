import { Injectable } from '@nestjs/common';
import { User } from '../schemas/user.schema';
import { UserRepository } from '../user.repository';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import * as argon2 from 'argon2';

type JoinedUserRow = {
  users: User;
  roles: {
    id: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
};

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) { }

  async getAllWithRoles() {
    const rows = await this.userRepository.queryUsersInfo() as JoinedUserRow[];
    const usersMap = new Map<string, User & { roles: string[] }>();

    for (const row of rows) {
      const baseUser = row.users;
      const existingUser = usersMap.get(baseUser.id);

      if (!existingUser) {
        usersMap.set(baseUser.id, {
          ...baseUser,
          roles: row.roles?.name ? [row.roles.name] : [],
        });
        continue;
      }

      if (row.roles?.name && !existingUser.roles.includes(row.roles.name)) {
        existingUser.roles.push(row.roles.name);
      }
    }

    return Array.from(usersMap.values());
  }

  async getAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    return users;
  }

  async getById(id: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ id: id });
    return user;
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
    const user = await this.userRepository.insertOne({
      ...createUserDto,
      password: await argon2.hash(createUserDto.password),
      emailVerified: createUserDto.emailVerified ?? false,
    });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    const user = await this.userRepository.updateOne({ id: id }, updateUserDto);
    return user;
  }

  async delete(id: string): Promise<User | null> {
    const user = await this.userRepository.deleteOne({ id: id });
    return user;
  }

  async queryUserInfo(uuid: string) {
    const user = await this.userRepository.queryUserInfo(uuid);
    return user;
  }
}
