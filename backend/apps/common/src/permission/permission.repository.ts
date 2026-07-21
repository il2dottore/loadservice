import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '@app/database/postgresql/postgresql.module';
import { BasePostgresRepository } from '@app/database/postgresql/repository/base.repository';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import {
  permissionEntity,
  rolePermissionEntity,
} from '../entities/permission.entity';
import { eq } from 'drizzle-orm';

@Injectable()
export class PermissionRepository extends BasePostgresRepository<
  typeof permissionEntity
> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, permissionEntity);
  }

  async deleteWithAssignments(key: string) {
    return this.postgres.transaction(async (tx) => {
      await tx
        .delete(rolePermissionEntity)
        .where(eq(rolePermissionEntity.permissionKey, key));
      const result = await tx
        .delete(permissionEntity)
        .where(eq(permissionEntity.key, key))
        .returning();
      return result[0] ?? null;
    });
  }
}
