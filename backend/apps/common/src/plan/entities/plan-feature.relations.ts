import { relations } from 'drizzle-orm';
import { planFeatureEntity } from './plan-feature.entity';
import { planEntity } from './plan.entity';
import { featureEntity } from '../../feature/entities/feature.entity';

export const plansFeaturesRelation = relations(planFeatureEntity, ({ one }) => ({
  plan: one(planEntity, {
    fields: [planFeatureEntity.planId],
    references: [planEntity.id],
  }),
  feature: one(featureEntity, {
    fields: [planFeatureEntity.featureId],
    references: [featureEntity.id],
  }),
}));
