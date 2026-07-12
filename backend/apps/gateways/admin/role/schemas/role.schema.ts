import { integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

/*
=============== DBML ===============
Table roles {
  id integer [pk]
  name varchar(255)
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}
=============== DBML ===============
*/

export const rolesTable = pgTable('roles', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Role = typeof rolesTable.$inferSelect;
