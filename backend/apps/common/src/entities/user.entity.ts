import {
  boolean,
  text,
  varchar,
  timestamp,
  uuid,
  pgTable,
} from 'drizzle-orm/pg-core';

export const userEntity = pgTable('users', {
  id: uuid().defaultRandom().primaryKey(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: text('password').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof userEntity.$inferSelect;
