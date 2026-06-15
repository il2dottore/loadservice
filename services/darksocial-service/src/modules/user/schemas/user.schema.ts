import { boolean } from 'drizzle-orm/pg-core';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: uuid().defaultRandom().primaryKey(),
  username: text().notNull().unique(),
  phoneNumber: text().unique(),
  email: text().notNull().unique(),
  emailVerified: boolean().notNull().default(false),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type User = typeof usersTable.$inferSelect;
