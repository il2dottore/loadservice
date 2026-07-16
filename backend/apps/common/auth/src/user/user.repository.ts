import { Inject, Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { POSTGRES } from '../../../../../libs/database/src/postgresql/postgresql.module';
import { BasePostgresRepository } from '../../../../../libs/database/src/postgresql/repository/base.repository';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { and, eq, gt } from 'drizzle-orm';
import { featureEntity } from '../../../feature/src/entities/feature.entity';
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
      .leftJoin(planFeatureEntity, eq(planFeatureEntity.planId, planEntity.id))
      .leftJoin(
        featureEntity,
        eq(featureEntity.id, planFeatureEntity.featureId),
      );
  }

  // 1. Select all features ID from all current active plans of users
  async queryUserFeatureIds(userId: string) {
    const rows = await this.postgres
      .select({ featureId: planFeatureEntity.featureId })
      .from(usersPlansTable)
      .innerJoin(
        planFeatureEntity,
        eq(planFeatureEntity.planId, usersPlansTable.planId),
      )
      .where(
        and(
          eq(usersPlansTable.userId, userId),
          gt(usersPlansTable.expirationDate, new Date()),
        ),
      );
    return rows.map(({ featureId }) => featureId);
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

  async getPlans(userId: string) {
    return this.postgres
      .select()
      .from(usersPlansTable)
      .where(eq(usersPlansTable.userId, userId));
  }
  async assignPaidPlan(
    userId: string,
    planId: number,
    requestedExpiration?: Date,
  ) {
    const [plan] = await this.postgres
      .select()
      .from(planEntity)
      .where(eq(planEntity.id, planId))
      .limit(1);
    if (!plan) throw new Error(`Plan ${planId} not found`);
    const [current] = await this.postgres
      .select({ plan: planEntity, assignment: usersPlansTable })
      .from(usersPlansTable)
      .innerJoin(planEntity, eq(planEntity.id, usersPlansTable.planId))
      .where(eq(usersPlansTable.userId, userId))
      .limit(1);
    const now = new Date();
    if (
      current?.assignment.expirationDate > now &&
      plan.price < current.plan.price
    ) {
      throw new BadRequestException(
        'You cannot purchase a cheaper plan while your current plan is active',
      );
    }
    const expirationDate =
      requestedExpiration ??
      (current?.assignment.expirationDate > now && plan.id === current.plan.id
        ? new Date(
            current.assignment.expirationDate.getTime() +
              plan.days * 24 * 60 * 60 * 1000,
          )
        : new Date(now.getTime() + plan.days * 24 * 60 * 60 * 1000));
    return this.postgres
      .insert(usersPlansTable)
      .values({ userId, planId, expirationDate })
      .onConflictDoUpdate({
        target: usersPlansTable.userId,
        set: { planId, expirationDate, updatedAt: new Date() },
      })
      .returning();
  }

  async updatePlan(userId: string, planId: number, expirationDate: Date) {
    return this.postgres
      .update(usersPlansTable)
      .set({ expirationDate, updatedAt: new Date() })
      .where(
        and(
          eq(usersPlansTable.userId, userId),
          eq(usersPlansTable.planId, planId),
        ),
      )
      .returning();
  }
  async removePlan(userId: string, planId: number) {
    return this.postgres
      .delete(usersPlansTable)
      .where(
        and(
          eq(usersPlansTable.userId, userId),
          eq(usersPlansTable.planId, planId),
        ),
      )
      .returning();
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
