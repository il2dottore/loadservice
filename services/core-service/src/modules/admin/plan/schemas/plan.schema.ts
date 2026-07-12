import { plansFeaturesTable } from "@modules/admin/feature/schemas/feature.schema";
import { usersTable } from "@modules/user/schemas/user.schema";
import { relations } from "drizzle-orm";
import { pgTable, varchar, integer, uuid, boolean, timestamp } from "drizzle-orm/pg-core";

/*
=============== DBML ===============
Table plans {
  id integer [pk]
  name varchar(255) [unique, not null]
  price integer [not null]
  max_duration integer [not null]
  max_concurrents integer [not null]
  is_custom bool [not null]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}
=============== DBML ===============
*/

export const plansTable = pgTable('plans', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).unique().notNull(),
  price: integer('price').notNull(),
  maxDuration: integer('max_duration').notNull(),
  maxConcurrents: integer('max_concurrents').notNull(),
  isCustom: boolean('is_custom').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/*
Table users_plans {
  id integer [pk]
  user_id uuid
  plan_id integer
  expiration_date datetime [not null]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}
*/

export const usersPlansTable = pgTable('users_plans', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  planId: integer('plan_id').notNull().references(() => plansTable.id),
  expirationDate: timestamp('expiration_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const plansRelation = relations(plansTable, ({ many }) => ({
  usersPlans: many(usersPlansTable),
  plansFeatures: many(plansFeaturesTable),
}));

export const usersPlansRelations = relations(usersPlansTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [usersPlansTable.userId],
    references: [usersTable.id]
  }),
  plan: one(plansTable, {
    fields: [usersPlansTable.planId],
    references: [plansTable.id]
  })
}));

export type Plan = typeof plansTable.$inferSelect;
