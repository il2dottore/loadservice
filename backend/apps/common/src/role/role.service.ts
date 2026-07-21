import { Injectable } from '@nestjs/common';
import { Role } from '../entities/role.entity';
import { CreateRoleDto } from './dtos/create-role.dto';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { RoleRepository } from './role.repository';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async getAll(): Promise<Role[]> {
    return await this.roleRepository.find();
  }

  async getById(roleKey: string) {
    return await this.roleRepository.queryRoleInfo(roleKey);
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    return await this.roleRepository.insertOne(createRoleDto);
  }

  async update(
    key: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<Role | null> {
    return await this.roleRepository.updateOne({ key }, updateRoleDto);
  }

  async delete(key: string): Promise<Role | null> {
    return await this.roleRepository.deleteOne({ key });
  }

  async assignPermission(roleKey: string, permissionId: string) {
    return await this.roleRepository.assignPermission(roleKey, permissionId);
  }

  async removePermission(roleKey: string, permissionId: string) {
    return await this.roleRepository.removePermission(roleKey, permissionId);
  }
}
