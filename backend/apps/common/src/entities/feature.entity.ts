import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';

export const featureEntity = pgTable('features', {
  id: varchar('id', { length: 100 }).primaryKey().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Feature = typeof featureEntity.$inferSelect;
