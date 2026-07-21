import {
  pgTable,
  varchar,
  integer,
  uuid,
  boolean,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { userEntity } from './user.entity';
import { relations } from 'drizzle-orm';
import { planFeatureEntity } from './plan-feature.entity';

export const planEntity = pgTable('plans', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).unique().notNull(),
  price: integer('price').notNull(),
  days: integer('days').notNull(),
  maxDuration: integer('max_duration').notNull(),
  maxConcurrents: integer('max_concurrents').notNull(),
  isCustom: boolean('is_custom').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersPlansTable = pgTable(
  'users_plans',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    userId: uuid('user_id')
      .notNull()
      .references(() => userEntity.id, { onDelete: 'cascade' }),
    planId: integer('plan_id')
      .notNull()
      .references(() => planEntity.id),
    expirationDate: timestamp('expiration_date').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    onePlanPerUser: uniqueIndex('users_plans_user_id_unique').on(table.userId),
  }),
);

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

export type Plan = typeof planEntity.$inferSelect;

/*
import { relations } from 'drizzle-orm';
import { planEntity, usersPlansTable } from './plan.entity';
import { planFeatureEntity } from './plan-feature.entity';
import { userEntity } from './user.entity';

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
*/
