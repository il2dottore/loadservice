import { plansTable } from "@modules/admin/plan/schemas/plan.schema";
import { relations } from "drizzle-orm";
import { integer, pgTable, primaryKey, varchar, timestamp } from "drizzle-orm/pg-core";

/*
=============== DBML ===============
Table features {
  id varchar(100) [pk, unique, not null]
  name varchar(100) [not null]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}
=============== DBML ===============
*/
export const featuresTable = pgTable('features', {
  id: varchar('id', { length: 100 }).primaryKey().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const plansFeaturesTable = pgTable('plans_features', {
  planId: integer('plan_id').notNull().references(() => plansTable.id),
  featureId: varchar('feature_id', { length: 100 }).notNull().references(() => featuresTable.id),
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
