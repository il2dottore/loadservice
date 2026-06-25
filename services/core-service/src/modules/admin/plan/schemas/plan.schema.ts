import { pgTable, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";

/*
=============== DBML ===============
Table plans {
  id integer [pk]
  name varchar(255) [unique, not null]
  price integer [not null]
  max_duration integer [not null]
  max_concurrents integer [not null]
  is_custom bool [not null]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}
=============== DBML ===============
*/

export const plansTable = pgTable('plans', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).unique().notNull(),
  price: integer('price').notNull(),
  maxDuration: integer('max_duration').notNull(),
  maxConcurrents: integer('max_concurrents').notNull(),
  isCustom: boolean('is_custom').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Plan = typeof plansTable.$inferSelect;