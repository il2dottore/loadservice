import { relations } from 'drizzle-orm';
import { planEntity, usersPlansTable } from './plan.entity';
import { planFeatureEntity } from './plan-feature.entity';
import { userEntity } from '../../../auth/src/entities/user.entity';

export const plansRelation = relations(planEntity, ({ many }) => ({
  usersPlans: many(usersPlansTable),
  plansFeatures: many(planFeatureEntity),
}));

export const usersPlansRelations = relations(usersPlansTable, ({ one }) => ({
  user: one(userEntity, {
    fields: [usersPlansTable.userId],
    references: [userEntity.id],
  }),
  plan: one(planEntity, {
    fields: [usersPlansTable.planId],
    references: [planEntity.id],
  }),
}));
