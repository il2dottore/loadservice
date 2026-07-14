import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '../../../../../libs/database/src/postgresql/postgresql.module';
import { BasePostgresRepository } from '../../../../../libs/database/src/postgresql/repository/base.repository';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { and, eq } from 'drizzle-orm';
import {
  featureEntity,
} from '../../../feature/src/entities/feature.entity';
import {
  planEntity,
  usersPlansTable,
} from '../../../plan/src/entities/plan.entity';
import { roleEntity } from '../entities/role.entity';
import { userRoleEntity } from '../entities/user-role.entity';
import { Role } from '../role/enums/role.enum';
import { userEntity } from '../entities/user.entity';
import { rolePermissionEntity } from '../entities/permission.entity';
import { planFeatureEntity } from '../../../plan/src/entities/plan-feature.entity';

@Injectable()
export class UserRepository extends BasePostgresRepository<typeof userEntity> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, userEntity);
  }

  async queryUserDetails(id: string) {
    return await this.postgres
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .leftJoin(userRoleEntity, eq(userRoleEntity.userId, this.table.id))
      .leftJoin(roleEntity, eq(roleEntity.key, userRoleEntity.roleKey))
      .leftJoin(
        rolePermissionEntity,
        eq(rolePermissionEntity.roleKey, roleEntity.key),
      )
      .leftJoin(usersPlansTable, eq(usersPlansTable.userId, this.table.id))
      .leftJoin(planEntity, eq(planEntity.id, usersPlansTable.planId))
      .leftJoin(
        planFeatureEntity,
        eq(planFeatureEntity.planId, planEntity.id),
      )
      .leftJoin(
        featureEntity,
        eq(featureEntity.id, planFeatureEntity.featureId),
      );
  }

  async createWithDefaultAccess(user: typeof userEntity.$inferInsert) {
    return this.postgres.transaction(async (tx) => {
      const [[userRole], [freePlan]] = await Promise.all([
        tx
          .select()
          .from(roleEntity)
          .where(eq(roleEntity.key, Role.USER))
          .limit(1),
        tx
          .select()
          .from(planEntity)
          .where(eq(planEntity.name, 'Free'))
          .limit(1),
      ]);

      if (!userRole || !freePlan) {
        throw new Error('Default USER role or Free plan is not configured');
      }

      const [createdUser] = await tx
        .insert(userEntity)
        .values(user)
        .returning();
      const expirationDate = new Date('2099-12-31T23:59:59.999Z');

      await Promise.all([
        tx.insert(userRoleEntity).values({
          userId: createdUser.id,
          roleKey: userRole.key,
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

  async assignRole(userId: string, roleKey: string) {
    const [result] = await this.postgres
      .insert(userRoleEntity)
      .values({ userId, roleKey })
      .returning();
    return result;
  }

  async removeRole(userId: string, roleKey: string) {
    const [result] = await this.postgres
      .delete(userRoleEntity)
      .where(
        and(
          eq(userRoleEntity.userId, userId),
          eq(userRoleEntity.roleKey, roleKey),
        ),
      )
      .returning();
    return result ?? null;
  }
}
