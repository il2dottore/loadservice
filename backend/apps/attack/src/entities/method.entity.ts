import { attackEntity } from './attack.entity';
import { relations } from 'drizzle-orm';
import {
  integer,
  pgTable,
  varchar,
  pgEnum,
  timestamp,
  primaryKey,
} from 'drizzle-orm/pg-core';

export const osiLayerEnum = pgEnum('osi_layer', ['LAYER_4', 'LAYER_7']);

export class OsiLayer {
  static readonly LAYER_4 = 'LAYER_4';
  static readonly LAYER_7 = 'LAYER_7';
}

export type OsiLayerValue = typeof OsiLayer.LAYER_4 | typeof OsiLayer.LAYER_7;

export const methodsTable = pgTable('methods', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).unique().notNull(),
  osiLayer: osiLayerEnum('osi_layer').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const methodsRelations = relations(methodsTable, ({ many }) => ({
  attacks: many(attackEntity),
  features: many(methodsFeaturesTable),
}));

export const methodsFeaturesTable = pgTable(
  'methods_features',
  {
    methodId: integer('method_id')
      .notNull()
      .references(() => methodsTable.id, { onDelete: 'cascade' }),
    // Features belong to the common database; this database stores the ID only.
    featureId: varchar('feature_id', { length: 100 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.methodId, table.featureId] })],
);

export type Method = typeof methodsTable.$inferSelect;
