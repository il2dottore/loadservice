import { Injectable } from '@nestjs/common';
import { User } from '../schemas/user.schema';
import { UserRepository } from '../user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getAllUsers(): Promise<User[]> {
    const users = await this.userRepository.find();
    return users;
  }
}
