import { Controller, Get } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { UserService } from './services/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @ApiProperty({
    description: 'Get all users',
  })
  @Get()
  async findAll() {
    const users = await this.userService.getAllUsers();
    return users;
  }
}
