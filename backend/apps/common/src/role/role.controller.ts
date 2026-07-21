import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AssignPermissionDto } from './dtos/assign-permission.dto';
import { CreateRoleDto } from './dtos/create-role.dto';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { RoleService } from './role.service';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({ summary: 'Get all roles' })
  @Get()
  async getAll() {
    return await this.roleService.getAll();
  }

  @ApiOperation({ summary: 'Get role by ID with relations' })
  @Get(':id')
  async getById(@Param('id') roleKey: string) {
    return await this.roleService.getById(roleKey);
  }

  @ApiOperation({ summary: 'Create role' })
  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    return await this.roleService.create(createRoleDto);
  }

  @ApiOperation({ summary: 'Update role' })
  @Put(':id')
  async update(@Param('id') key: string, @Body() updateRoleDto: UpdateRoleDto) {
    return await this.roleService.update(key, updateRoleDto);
  }

  @ApiOperation({ summary: 'Delete role' })
  @Delete(':id')
  async delete(@Param('id') key: string) {
    return await this.roleService.delete(key);
  }

  @ApiOperation({ summary: 'Assign permission to role' })
  @Post(':id/permissions')
  async assignPermission(
    @Param('id') roleKey: string,
    @Body() assignPermissionDto: AssignPermissionDto,
  ) {
    return await this.roleService.assignPermission(
      roleKey,
      assignPermissionDto.permissionId,
    );
  }

  @ApiOperation({ summary: 'Remove permission from role' })
  @Delete(':id/permissions/:permissionId')
  async removePermission(
    @Param('id') roleKey: string,
    @Param('permissionId') permissionId: string,
  ) {
    return await this.roleService.removePermission(roleKey, permissionId);
  }
}
