import { planEntity } from "./plan.entity";
import { integer, pgTable, primaryKey, varchar, timestamp } from "drizzle-orm/pg-core";
import { featureEntity } from "../../feature/entities/feature.entity";

export const planFeatureEntity = pgTable('plans_features', {
  planId: integer('plan_id').notNull().references(() => planEntity.id),
  featureId: varchar('feature_id', { length: 100 }).notNull().references(() => featureEntity.id),
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
