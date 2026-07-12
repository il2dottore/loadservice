import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AssignPermissionDto } from './dtos/assign-permission.dto';
import { AssignUserRoleDto } from './dtos/assign-user-role.dto';
import { CreateRoleDto } from './dtos/create-role.dto';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { RoleService } from './services/role.service';

@Controller('admin/roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  @ApiOperation({ summary: 'Get all roles' })
  @Get()
  async getAll() {
    return await this.roleService.getAll();
  }

  @ApiOperation({ summary: 'Get role by ID with relations' })
  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.roleService.getById(Number(id));
  }

  @ApiOperation({ summary: 'Create role' })
  @Post('create')
  async create(@Body() createRoleDto: CreateRoleDto) {
    return await this.roleService.create(createRoleDto);
  }

  @ApiOperation({ summary: 'Update role' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return await this.roleService.update(Number(id), updateRoleDto);
  }

  @ApiOperation({ summary: 'Delete role' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.roleService.delete(Number(id));
  }

  @ApiOperation({ summary: 'Assign permission to role' })
  @Post(':id/permissions')
  async assignPermission(@Param('id') id: string, @Body() assignPermissionDto: AssignPermissionDto) {
    return await this.roleService.assignPermission(Number(id), assignPermissionDto.permissionId);
  }

  @ApiOperation({ summary: 'Remove permission from role' })
  @Delete(':id/permissions/:permissionId')
  async removePermission(@Param('id') id: string, @Param('permissionId') permissionId: string) {
    return await this.roleService.removePermission(Number(id), permissionId);
  }

  @ApiOperation({ summary: 'Assign role to user' })
  @Post(':id/users')
  async assignRoleToUser(@Param('id') id: string, @Body() assignUserRoleDto: AssignUserRoleDto) {
    return await this.roleService.assignRoleToUser(Number(id), assignUserRoleDto.userId);
  }

  @ApiOperation({ summary: 'Remove role from user' })
  @Delete(':id/users/:userId')
  async removeRoleFromUser(@Param('id') id: string, @Param('userId') userId: string) {
    return await this.roleService.removeRoleFromUser(Number(id), userId);
  }
}
