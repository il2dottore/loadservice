import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '../../../../../libs/database/src/postgresql/postgresql.provider';
import { BasePostgresRepository } from '../../../../../libs/database/src/postgresql/repository/base.repository';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { and, eq } from 'drizzle-orm';
import { permissionsTable, rolesPermissionsTable } from '../../permission/src/schemas/permission.schema';
import { usersRolesTable } from './schemas/user-role.schema';
import { usersTable } from '../../../user/src/schemas/user.schema';
import { rolesTable } from './schemas/role.schema';

@Injectable()
export class RoleRepository extends BasePostgresRepository<typeof rolesTable> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, rolesTable);
  }

  async queryRoleInfo(id: number) {
    return await this.postgres
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .leftJoin(rolesPermissionsTable, eq(rolesPermissionsTable.roleId, this.table.id))
      .leftJoin(permissionsTable, eq(permissionsTable.id, rolesPermissionsTable.permissionId))
      .leftJoin(usersRolesTable, eq(usersRolesTable.roleId, this.table.id))
      .leftJoin(usersTable, eq(usersTable.id, usersRolesTable.userId));
  }

  async assignPermission(roleId: number, permissionId: string) {
    const result = await this.postgres
      .insert(rolesPermissionsTable)
      .values({ roleId, permissionId })
      .returning();
    return result[0];
  }

  async removePermission(roleId: number, permissionId: string) {
    const result = await this.postgres
      .delete(rolesPermissionsTable)
      .where(and(eq(rolesPermissionsTable.roleId, roleId), eq(rolesPermissionsTable.permissionId, permissionId)))
      .returning();
    return result[0] ?? null;
  }

  async assignRoleToUser(roleId: number, userId: string) {
    const result = await this.postgres
      .insert(usersRolesTable)
      .values({ roleId, userId })
      .returning();
    return result[0];
  }

  async removeRoleFromUser(roleId: number, userId: string) {
    const result = await this.postgres
      .delete(usersRolesTable)
      .where(and(eq(usersRolesTable.roleId, roleId), eq(usersRolesTable.userId, userId)))
      .returning();
    return result[0] ?? null;
  }
}
