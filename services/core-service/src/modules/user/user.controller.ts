import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { UserService } from './services/user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { DeleteUserDto } from './dtos/delete-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }
  @ApiProperty({
    description: 'Get all users',
  })
  @Get()
  async getAllUsers() {
    const users = await this.userService.getAllWithRoles();
    return users;
  }

  @ApiProperty({
    description: 'Get user by ID',
  })
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.queryUserInfo(id);
    return user;
  }

  @ApiProperty({
    description: 'Create user',
  })
  @Post('create')
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return user;
  }

  @ApiProperty({
    description: 'Update user',
  })
  @Put(':id')
  async update(@Body() updateUserDto: UpdateUserDto, @Param('id') id: string) {
    const user = await this.userService.update(id, updateUserDto);
    return user;
  }

  @ApiProperty({
    description: 'Delete user',
  })
  @Delete(':id')
  async delete(@Param() deleteUserDto: DeleteUserDto) {
    const user = await this.userService.delete(deleteUserDto.id);
    return user;
  }
}
