import { featureEntity } from './feature.entity';
import { planEntity } from './plan.entity';
import {
  integer,
  pgTable,
  primaryKey,
  varchar,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const planFeatureEntity = pgTable(
  'plans_features',
  {
    planId: integer('plan_id')
      .notNull()
      .references(() => planEntity.id),
    featureId: varchar('feature_id', { length: 100 })
      .notNull()
      .references(() => featureEntity.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => {
    return [
      primaryKey({
        columns: [table.planId, table.featureId],
      }),
    ];
  },
);

export const plansFeaturesRelation = relations(
  planFeatureEntity,
  ({ one }) => ({
    plan: one(planEntity, {
      fields: [planFeatureEntity.planId],
      references: [planEntity.id],
    }),
    feature: one(featureEntity, {
      fields: [planFeatureEntity.featureId],
      references: [featureEntity.id],
    }),
  }),
);

/*
// plan-feature.relations.ts
import { relations } from 'drizzle-orm';
import { planFeatureEntity } from './plan-feature.entity';
import { planEntity } from './plan.entity';
import { featureEntity } from './feature.entity';

export const plansFeaturesRelation = relations(
  planFeatureEntity,
  ({ one }) => ({
    plan: one(planEntity, {
      fields: [planFeatureEntity.planId],
      references: [planEntity.id],
    }),
    feature: one(featureEntity, {
      fields: [planFeatureEntity.featureId],
      references: [featureEntity.id],
    }),
  }),
);
*/
