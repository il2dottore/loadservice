import { text } from 'drizzle-orm/pg-core';
import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const roleEntity = pgTable('roles', {
  key: varchar('display_name', { length: 255 }).primaryKey(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  description: text().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Role = typeof roleEntity.$inferSelect;
