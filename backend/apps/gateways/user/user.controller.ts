import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { UserService } from './services/user.service';
import { CreateUserDto } from './dtos/requests/create-user.dto';
import { UpdateUserDto } from './dtos/requests/update-user.dto';
import { DeleteUserDto } from './dtos/requests/delete-user.dto';
import { UserDetails, UserResponse } from './dtos/responses/user-details';
import { sendError, sendSuccess } from '../../../common/helpers/response.helper';
import { Role } from '../../../libs/auth/src/decorators/role.decorator';
import { JwtAuthGuard } from '../../../libs/auth/src/guards/jwt-auth.guard';
import { ResourceOwnerGuard } from '../../../libs/auth/src/guards/resource-owner.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) { }

  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({ type: UserResponse, isArray: true })
  @Get()
  async getAllUsers(
    @Res() res: Response,
    @Query('perPage') perPage: number = 5,
    @Query('page') page: number = 1,
  ) {
    try {
      const users = await this.userService.getAll(
        +perPage,
        +page,
      );
      return sendSuccess(res, 'Get all users successfully', users, HttpStatus.OK);
    } catch (error) {
      return sendError(res, error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: 'Get user details data by ID' })
  @ApiOkResponse({ type: UserDetails })
  @Get(':id/details')
  @Role('ADMINISTRATOR')
  @UseGuards(ResourceOwnerGuard)
  async getUserDetailsById(@Res() res: Response, @Param('id') id: string) {
    try {
      const user = await this.userService.getUserDetailsById(id);
      return sendSuccess(res, 'Get user details successfully', user, HttpStatus.OK);
    } catch (error) {
      const httpCode = error instanceof Error && error.message === 'User details not found'
        ? HttpStatus.NOT_FOUND
        : HttpStatus.INTERNAL_SERVER_ERROR;
      return sendError(res, error, httpCode);
    }
  }

  @ApiOperation({ summary: 'Get all user details data' })
  @ApiOkResponse({ type: UserDetails, isArray: true })
  @Get('details')
  async getUserDetails(
    @Res() res: Response,
    @Query('perPage') perPage: number = 5,
    @Query('page') page: number = 1,
  ) {
    try {
      const user = await this.userService.getAllUsersDetails(
        +perPage,
        +page
      );
      return sendSuccess(res, 'Get all user details successfully', user, HttpStatus.OK);
    } catch (error) {
      return sendError(res, error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: 'Get total users count' })
  @ApiOkResponse({ description: 'Total users count' })
  @Get('count')
  async countAllUsers(@Res() res: Response) {
    try {
      const totalUsers = await this.userService.countAll();
      return sendSuccess(res, 'Get total users count successfully', { count: totalUsers }, HttpStatus.OK);
    } catch (error) {
      return sendError(res, error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiOkResponse({ type: UserResponse })
  @Get(':id')
  @Role('ADMINISTRATOR')
  @UseGuards(ResourceOwnerGuard)
  async getUserById(@Res() res: Response, @Param('id') id: string) {
    try {
      const user = await this.userService.getById(id);
      return sendSuccess(res, 'Get user successfully', user, HttpStatus.OK);
    } catch (error) {
      const httpCode = error instanceof Error && error.message === 'User not found'
        ? HttpStatus.NOT_FOUND
        : HttpStatus.INTERNAL_SERVER_ERROR;
      return sendError(res, error, httpCode);
    }
  }

  @ApiOperation({ summary: 'Create user' })
  @ApiCreatedResponse({ type: UserResponse })
  @Post('create')
  async create(@Res() res: Response, @Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.userService.create(createUserDto);
      return sendSuccess(res, 'Create user successfully', user, HttpStatus.CREATED);
    } catch (error) {
      return sendError(res, error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: 'Update user' })
  @ApiOkResponse({ type: UserResponse })
  @Put(':id')
  @Role('ADMINISTRATOR')
  @UseGuards(ResourceOwnerGuard)
  async update(
    @Res() res: Response,
    @Body() updateUserDto: UpdateUserDto,
    @Param('id') id: string,
  ) {
    try {
      const user = await this.userService.update(id, updateUserDto);
      return sendSuccess(res, 'Update user successfully', user, HttpStatus.OK);
    } catch (error) {
      const httpCode = error instanceof Error && error.message === 'User not found'
        ? HttpStatus.NOT_FOUND
        : HttpStatus.INTERNAL_SERVER_ERROR;
      return sendError(res, error, httpCode);
    }
  }

  @ApiOperation({ summary: 'Delete user' })
  @ApiOkResponse({ type: UserResponse })
  @Delete(':id')
  @Role('ADMINISTRATOR')
  @UseGuards(ResourceOwnerGuard)
  async delete(@Res() res: Response, @Param() deleteUserDto: DeleteUserDto) {
    try {
      const user = await this.userService.delete(deleteUserDto.id);
      return sendSuccess(res, 'Delete user successfully', user, HttpStatus.OK);
    } catch (error) {
      const httpCode = error instanceof Error && error.message === 'User not found'
        ? HttpStatus.NOT_FOUND
        : HttpStatus.INTERNAL_SERVER_ERROR;
      return sendError(res, error, httpCode);
    }
  }
}
