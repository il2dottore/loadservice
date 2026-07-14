import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '../../../../../libs/database/src/postgresql/postgresql.module';
import { BasePostgresRepository } from '../../../../../libs/database/src/postgresql/repository/base.repository';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { and, eq } from 'drizzle-orm';
import { userRoleEntity } from '../entities/user-role.entity';
import { roleEntity } from '../entities/role.entity';
import { permissionEntity, rolePermissionEntity } from '../entities/permission.entity';
import { userEntity } from '../entities/user.entity';

@Injectable()
export class RoleRepository extends BasePostgresRepository<typeof roleEntity> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, roleEntity);
  }

  async queryRoleInfo(key: string) {
    return await this.postgres
      .select()
      .from(this.table)
      .where(eq(this.table.key, key))
      .leftJoin(
        rolePermissionEntity,
        eq(rolePermissionEntity.roleKey, this.table.key),
      )
      .leftJoin(
        permissionEntity,
        eq(permissionEntity.key, rolePermissionEntity.permissionKey),
      )
      .leftJoin(userRoleEntity, eq(userRoleEntity.roleKey, this.table.key))
      .leftJoin(userEntity, eq(userEntity.id, userRoleEntity.userId));
  }

  async assignPermission(roleKey: string, permissionKey: string) {
    const result = await this.postgres
      .insert(rolePermissionEntity)
      .values({ roleKey, permissionKey })
      .returning();
    return result[0];
  }

  async removePermission(roleKey: string, permissionKey: string) {
    const result = await this.postgres
      .delete(rolePermissionEntity)
      .where(
        and(
          eq(rolePermissionEntity.roleKey, roleKey),
          eq(rolePermissionEntity.permissionKey, permissionKey),
        ),
      )
      .returning();
    return result[0] ?? null;
  }

  async assignRoleToUser(roleKey: string, userId: string) {
    const result = await this.postgres
      .insert(userRoleEntity)
      .values({ roleKey, userId })
      .returning();
    return result[0];
  }

  async removeRoleFromUser(roleKey: string, userId: string) {
    const result = await this.postgres
      .delete(userRoleEntity)
      .where(
        and(
          eq(userRoleEntity.roleKey, roleKey),
          eq(userRoleEntity.userId, userId),
        ),
      )
      .returning();
    return result[0] ?? null;
  }
}
