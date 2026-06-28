import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '@databases/postgresql/postgresql.provider';
import { BasePostgresRepository } from '@databases/postgresql/repository/base.repository';
import { usersTable } from './schemas/user.schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { eq } from 'drizzle-orm';
import { featuresTable, plansFeaturesTable } from '@modules/admin/feature/schemas/feature.schema';
import { plansTable, usersPlansTable } from '@modules/admin/plan/schemas/plan.schema';
import { rolesTable } from '@modules/admin/role/schemas/role.schema';
import { usersRolesTable } from '@modules/admin/role/schemas/user-role.schema';

@Injectable()
export class UserRepository extends BasePostgresRepository<typeof usersTable> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, usersTable);
  }

  async queryUsersInfo() {
    const users = await this.postgres
      .select()
      .from(this.table)
      .leftJoin(usersRolesTable, eq(usersRolesTable.userId, this.table.id))
      .leftJoin(rolesTable, eq(rolesTable.id, usersRolesTable.roleId));

    return users;
  }

  async queryUserInfo(uuid: string) {
    // Query user information, with relation plan information, plan features information
    const user = await this.postgres
      .select()
      .from(this.table)
      .where(eq(this.table.id, uuid))
      .leftJoin(usersPlansTable, eq(usersPlansTable.userId, this.table.id))
      .leftJoin(plansTable, eq(plansTable.id, usersPlansTable.planId))
      .leftJoin(plansFeaturesTable, eq(plansFeaturesTable.planId, plansTable.id))
      .leftJoin(featuresTable, eq(featuresTable.id, plansFeaturesTable.featureId))
      .leftJoin(usersRolesTable, eq(usersRolesTable.userId, this.table.id))
      .leftJoin(rolesTable, eq(rolesTable.id, usersRolesTable.roleId));

    return user;
  }
}
