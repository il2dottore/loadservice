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
  ApiParam,
} from '@nestjs/swagger';
import { CreateUserDto } from './dtos/requests/create-user.dto';
import { UpdateUserDto } from './dtos/requests/update-user.dto';
import { DeleteUserDto } from './dtos/requests/delete-user.dto';
import { UserDetails, UserResponse } from './dtos/responses/user-details';
import { Role } from '@app/auth/decorators/role.decorator';
import { ResourceOwnerGuard } from '@app/auth/guards/resource-owner.guard';
import { UserService } from './user.service';
import { JwtAuthGuard, RolesGuard } from '@app/auth';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get servers available to a user' })
  @ApiParam({ name: 'id', description: 'User ID', format: 'uuid' })
  @ApiOkResponse({
    description: 'Servers available through the user plans',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'EU server 1' },
          address: { type: 'string', example: '192.0.2.10' },
          slots: { type: 'integer', example: 10 },
        },
      },
    },
  })
  @Get(':id/allowed-servers')
  async getAllowedServers(@Param('id') userId: string): Promise<any> {
    try {
      return await this.userService.getAllowedServers(userId);
    } catch (error) {
      this.rethrowAsHttpException(error);
    }
  }

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
  @Role('ADMINISTRATOR')
  @UseGuards(ResourceOwnerGuard)
  @Get(':id/details')
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
  @Post(':userId/roles/:roleKey')
  async assignRole(
    @Param('userId') userId: string,
    @Param('roleKey') roleKey: string,
  ) {
    return await this.userService.assignRole(userId, roleKey);
  }

  @ApiOperation({ summary: 'Remove role from user' })
  @Delete(':userId/roles/:roleKey')
  async removeRole(
    @Param('userId') userId: string,
    @Param('roleKey') roleKey: string,
  ) {
    return await this.userService.removeRole(userId, roleKey);
  }

  @ApiOperation({ summary: 'List plans of a user' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @Get(':id/plans')
  async getPlans(@Param('id') id: string) {
    return this.userService.getPlans(id);
  }

  @ApiOperation({ summary: 'Add or replace a user plan' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @Post(':id/plans')
  async addPlan(
    @Param('id') id: string,
    @Body() body: { planId: number; expirationDate?: string },
  ) {
    return this.userService.addPlan(
      id,
      body.planId,
      body.expirationDate ? new Date(body.expirationDate) : undefined,
    );
  }

  @ApiOperation({ summary: 'Update a user plan' })
  @Put(':id/plans/:planId')
  async updatePlan(
    @Param('id') id: string,
    @Param('planId') planId: string,
    @Body() body: { expirationDate: string },
  ) {
    return this.userService.updatePlan(
      id,
      Number(planId),
      new Date(body.expirationDate),
    );
  }

  @ApiOperation({ summary: 'Remove a user plan' })
  @Delete(':id/plans/:planId')
  async removePlan(@Param('id') id: string, @Param('planId') planId: string) {
    return this.userService.removePlan(id, Number(planId));
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
