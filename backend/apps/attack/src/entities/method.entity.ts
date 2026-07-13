import { attackEntity } from "./attack.entity";
import { relations } from "drizzle-orm";
import { integer, pgTable, varchar, pgEnum, timestamp } from "drizzle-orm/pg-core";

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
}));

export type Method = typeof methodsTable.$inferSelect;
