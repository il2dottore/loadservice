import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CreatePermissionDto } from './dtos/create-permission.dto';
import { UpdatePermissionDto } from './dtos/update-permission.dto';
import { PermissionService } from './permission.service';
import { JwtAuthGuard, Role, RolesGuard } from '@app/auth';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @ApiOperation({ summary: 'Get all permissions' })
  @Get()
  async getAll() {
    return await this.permissionService.getAll();
  }

  @ApiOperation({ summary: 'Get permission by ID' })
  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.permissionService.getById(id);
  }

  @ApiOperation({ summary: 'Create permission' })
  @Post()
  @Role('ADMINISTRATOR')
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    return await this.permissionService.create(createPermissionDto);
  }

  @ApiOperation({ summary: 'Update permission' })
  @Put(':id')
  @Role('ADMINISTRATOR')
  async update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return await this.permissionService.update(id, updatePermissionDto);
  }

  @ApiOperation({ summary: 'Delete permission' })
  @Delete(':id')
  @Role('ADMINISTRATOR')
  async delete(@Param('id') id: string) {
    return await this.permissionService.delete(id);
  }
}
