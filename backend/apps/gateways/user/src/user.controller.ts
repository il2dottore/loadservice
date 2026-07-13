import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { UserService } from './services/user.service';
import { CreateUserDto } from './dtos/requests/create-user.dto';
import { UpdateUserDto } from './dtos/requests/update-user.dto';
import { DeleteUserDto } from './dtos/requests/delete-user.dto';
import { UserDetails, UserResponse } from './dtos/responses/user-details';
import { JwtAuthGuard, ResourceOwnerGuard, Role } from '@app/auth';

@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({ type: UserResponse, isArray: true })
  @Get()
  async getAllUsers(
    @Query('perPage') perPage: number = 5,
    @Query('page') page: number = 1,
  ) {
    try {
      return await this.userService.getAll(+perPage, +page);
    } catch (error) {
      this.rethrowAsHttpException(error);
    }
  }

  @ApiOperation({ summary: 'Get user details data by ID' })
  @ApiOkResponse({ type: UserDetails })
  @Get(':id/details')
  @Role('ADMINISTRATOR')
  @UseGuards(ResourceOwnerGuard)
  async getUserDetailsById(@Param('id') id: string) {
    try {
      return await this.userService.getUserDetailsById(id);
    } catch (error) {
      this.rethrowAsHttpException(error, {
        'User details not found': HttpStatus.NOT_FOUND,
      });
    }
  }

  @ApiOperation({ summary: 'Get all user details data' })
  @ApiOkResponse({ type: UserDetails, isArray: true })
  @Get('details')
  async getUserDetails(
    @Query('perPage') perPage: number = 5,
    @Query('page') page: number = 1,
  ) {
    try {
      return await this.userService.getAllUsersDetails(+perPage, +page);
    } catch (error) {
      this.rethrowAsHttpException(error);
    }
  }

  @ApiOperation({ summary: 'Get total users count' })
  @ApiOkResponse({ description: 'Total users count' })
  @Get('count')
  async countAllUsers() {
    try {
      const totalUsers = await this.userService.countAll();
      return { count: totalUsers };
    } catch (error) {
      this.rethrowAsHttpException(error);
    }
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiOkResponse({ type: UserResponse })
  @Get(':id')
  @Role('ADMINISTRATOR')
  @UseGuards(ResourceOwnerGuard)
  async getUserById(@Param('id') id: string) {
    try {
      return await this.userService.getById(id);
    } catch (error) {
      this.rethrowAsHttpException(error, {
        'User not found': HttpStatus.NOT_FOUND,
      });
    }
  }

  @ApiOperation({ summary: 'Create user' })
  @ApiCreatedResponse({ type: UserResponse })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.userService.create(createUserDto);
    } catch (error) {
      this.rethrowAsHttpException(error);
    }
  }

  @ApiOperation({ summary: 'Update user' })
  @ApiOkResponse({ type: UserResponse })
  @Put(':id')
  @Role('ADMINISTRATOR')
  @UseGuards(ResourceOwnerGuard)
  async update(@Body() updateUserDto: UpdateUserDto, @Param('id') id: string) {
    try {
      return await this.userService.update(id, updateUserDto);
    } catch (error) {
      this.rethrowAsHttpException(error, {
        'User not found': HttpStatus.NOT_FOUND,
      });
    }
  }

  @ApiOperation({ summary: 'Delete user' })
  @ApiOkResponse({ type: UserResponse })
  @Delete(':id')
  @Role('ADMINISTRATOR')
  @UseGuards(ResourceOwnerGuard)
  async delete(@Param() deleteUserDto: DeleteUserDto) {
    try {
      return await this.userService.delete(deleteUserDto.id);
    } catch (error) {
      this.rethrowAsHttpException(error, {
        'User not found': HttpStatus.NOT_FOUND,
      });
    }
  }

  @ApiOperation({ summary: 'Assign role to user' })
  @Post(':userId/roles/:roleId')
  async assignRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    return await this.userService.assignRole(userId, Number(roleId));
  }

  @ApiOperation({ summary: 'Remove role from user' })
  @Delete(':userId/roles/:roleId')
  async removeRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    return await this.userService.removeRole(userId, Number(roleId));
  }

  private rethrowAsHttpException(
    error: unknown,
    statusMap: Record<string, HttpStatus> = {},
  ): never {
    if (error instanceof HttpException) {
      throw error;
    }

    if (error instanceof Error) {
      const status = statusMap[error.message];

      if (status === HttpStatus.NOT_FOUND) {
        throw new NotFoundException(error.message);
      }

      throw new InternalServerErrorException(error.message);
    }

    throw new InternalServerErrorException('Internal server error');
  }
}
