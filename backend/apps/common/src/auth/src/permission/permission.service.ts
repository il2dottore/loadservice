import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dtos/create-permission.dto';
import { UpdatePermissionDto } from './dtos/update-permission.dto';
import { Permission } from '../entities/permission.entity';
import { PermissionRepository } from './permission.repository';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async getAll(): Promise<Permission[]> {
    return await this.permissionRepository.find();
  }

  async getById(key: string): Promise<Permission | null> {
    return await this.permissionRepository.findOne({ key });
  }

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    return await this.permissionRepository.insertOne(createPermissionDto);
  }

  async update(
    key: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission | null> {
    return await this.permissionRepository.updateOne(
      { key },
      updatePermissionDto,
    );
  }

  async delete(key: string): Promise<Permission | null> {
    return await this.permissionRepository.deleteWithAssignments(key);
  }
}
