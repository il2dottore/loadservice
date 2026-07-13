import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { Role } from '../schemas/role.schema';
import { RoleRepository } from '../role.repository';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async getAll(): Promise<Role[]> {
    return await this.roleRepository.find();
  }

  async getById(id: number) {
    return await this.roleRepository.queryRoleInfo(id);
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    return await this.roleRepository.insertOne(createRoleDto);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role | null> {
    return await this.roleRepository.updateOne({ id }, updateRoleDto);
  }

  async delete(id: number): Promise<Role | null> {
    return await this.roleRepository.deleteOne({ id });
  }

  async assignPermission(roleId: number, permissionId: string) {
    return await this.roleRepository.assignPermission(roleId, permissionId);
  }

  async removePermission(roleId: number, permissionId: string) {
    return await this.roleRepository.removePermission(roleId, permissionId);
  }
}
