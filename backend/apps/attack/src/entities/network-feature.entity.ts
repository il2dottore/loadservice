import { integer, pgTable, varchar, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { networkEntity } from './network.entity';

export const networksFeaturesTable = pgTable('networks_features', {
  networkId: integer('network_id').notNull().references(() => networkEntity.id, { onDelete: 'cascade' }),
  featureId: varchar('feature_id', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [primaryKey({ columns: [table.networkId, table.featureId] })]);
