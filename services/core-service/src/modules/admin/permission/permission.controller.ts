import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CreatePermissionDto } from './dtos/create-permission.dto';
import { UpdatePermissionDto } from './dtos/update-permission.dto';
import { PermissionService } from './services/permission.service';

@Controller('admin/permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) { }

  @ApiProperty({ description: 'Get all permissions' })
  @Get()
  async getAll() {
    return await this.permissionService.getAll();
  }

  @ApiProperty({ description: 'Get permission by ID' })
  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.permissionService.getById(id);
  }

  @ApiProperty({ description: 'Create permission' })
  @Post('create')
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    return await this.permissionService.create(createPermissionDto);
  }

  @ApiProperty({ description: 'Update permission' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return await this.permissionService.update(id, updatePermissionDto);
  }

  @ApiProperty({ description: 'Delete permission' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.permissionService.delete(id);
  }
}
