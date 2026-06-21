import { Injectable } from '@nestjs/common';
import { User } from '../schemas/user.schema';
import { UserRepository } from '../user.repository';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    return users;
  }

  async getById(id: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ id: id });
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.insertOne(createUserDto);
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
}
