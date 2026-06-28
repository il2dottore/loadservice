import { plansTable } from "@modules/admin/plan/schemas/plan.schema";
import { relations } from "drizzle-orm";
import { integer, pgTable, primaryKey, varchar, timestamp } from "drizzle-orm/pg-core";

/*
=============== DBML ===============
Table features {
  id integer [pk]
  code varchar(100) [unique, not null]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}
=============== DBML ===============
*/

export const featuresTable = pgTable('features', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  code: varchar('code', { length: 100 }).unique().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const plansFeaturesTable = pgTable('plans_features', {
  planId: integer('plan_id').notNull().references(() => plansTable.id),
  featureId: integer('feature_id').notNull().references(() => featuresTable.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return [
    primaryKey({
      columns: [
        table.planId,
        table.featureId
      ]
    })
  ];
});

export const plansFeaturesRelation = relations(plansFeaturesTable, ({ one }) => ({
  plan: one(plansTable, {
    fields: [plansFeaturesTable.planId],
    references: [plansTable.id]
  }),
  feature: one(featuresTable, {
    fields: [plansFeaturesTable.featureId],
    references: [featuresTable.id]
  })
}));

export type Feature = typeof featuresTable.$inferSelect;
