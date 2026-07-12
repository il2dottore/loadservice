import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '@databases/postgresql/postgresql.provider';
import { BasePostgresRepository } from '@databases/postgresql/repository/base.repository';
import { usersTable } from './schemas/user.schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { eq } from 'drizzle-orm';
import { featuresTable, plansFeaturesTable } from '@modules/admin/feature/schemas/feature.schema';
import { plansTable, usersPlansTable } from '@modules/admin/plan/schemas/plan.schema';
import { rolesPermissionsTable } from '@modules/admin/permission/schemas/permission.schema';
import { rolesTable } from '@modules/admin/role/schemas/role.schema';
import { usersRolesTable } from '@modules/admin/role/schemas/user-role.schema';
import { Role } from '@modules/admin/role/enums/role.enum';

@Injectable()
export class UserRepository extends BasePostgresRepository<typeof usersTable> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, usersTable);
  }

  async queryUserDetails(id: string) {
    return await this.postgres
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .leftJoin(usersRolesTable, eq(usersRolesTable.userId, this.table.id))
      .leftJoin(rolesTable, eq(rolesTable.id, usersRolesTable.roleId))
      .leftJoin(rolesPermissionsTable, eq(rolesPermissionsTable.roleId, rolesTable.id))
      .leftJoin(usersPlansTable, eq(usersPlansTable.userId, this.table.id))
      .leftJoin(plansTable, eq(plansTable.id, usersPlansTable.planId))
      .leftJoin(plansFeaturesTable, eq(plansFeaturesTable.planId, plansTable.id))
      .leftJoin(featuresTable, eq(featuresTable.id, plansFeaturesTable.featureId));
  }

  async createWithDefaultAccess(user: typeof usersTable.$inferInsert) {
    return this.postgres.transaction(async (tx) => {
      const [[userRole], [freePlan]] = await Promise.all([
        tx
          .select()
          .from(rolesTable)
          .where(eq(rolesTable.name, Role.USER))
          .limit(1),
        tx
          .select()
          .from(plansTable)
          .where(eq(plansTable.name, 'Free'))
          .limit(1),
      ]);

      if (!userRole || !freePlan) {
        throw new Error('Default USER role or Free plan is not configured');
      }

      const [createdUser] = await tx.insert(usersTable).values(user).returning();
      const expirationDate = new Date('2099-12-31T23:59:59.999Z');

      await Promise.all([
        tx.insert(usersRolesTable).values({
          userId: createdUser.id,
          roleId: userRole.id,
        }),
        tx.insert(usersPlansTable).values({
          userId: createdUser.id,
          planId: freePlan.id,
          expirationDate,
        }),
      ]);

      return createdUser;
    });
  }
}
