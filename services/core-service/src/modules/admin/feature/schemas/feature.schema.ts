import { networksTable } from "@modules/admin/network/schemas/network.schema";
import { attacksTable } from "@modules/attack/schemas/attack.schema";
import { relations } from "drizzle-orm";
import { integer, pgTable, varchar, boolean, timestamp } from "drizzle-orm/pg-core";

/*
=============== DBML ===============
Table features {
  id integer [pk]
  code varchar(100) [unique, not null]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}
=============== DBML ===============
*/

export const featuresTable = pgTable('features', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    code: varchar('code', { length: 100 }).unique().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Feature = typeof featuresTable.$inferSelect;