import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from '../dtos/create-permission.dto';
import { UpdatePermissionDto } from '../dtos/update-permission.dto';
import { Permission } from '../schemas/permission.schema';
import { PermissionRepository } from '../permission.repository';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) { }

  async getAll(): Promise<Permission[]> {
    return await this.permissionRepository.find();
  }

  async getById(id: string): Promise<Permission | null> {
    return await this.permissionRepository.findOne({ id });
  }

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    return await this.permissionRepository.insertOne(createPermissionDto);
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission | null> {
    return await this.permissionRepository.updateOne({ id }, updatePermissionDto);
  }

  async delete(id: string): Promise<Permission | null> {
    return await this.permissionRepository.deleteOne({ id });
  }
}
