import { serversTable } from "@modules/admin/server/schemas/server.schema";
import { attacksTable } from "@modules/attack/schemas/attack.schema";
import { relations } from "drizzle-orm";
import { integer, pgTable, varchar, boolean, timestamp } from "drizzle-orm/pg-core";

/*
=============== DBML ===============
Table networks {
  id integer [pk]
  name varchar(255) [unique, not null]
  required_rank integer [not null]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`] 
}
=============== DBML ===============
*/

export const networksTable = pgTable('networks', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 255 }).unique().notNull(),
    requiredRank: integer('required_rank').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const networksRelations = relations(networksTable, ({ many }) => ({
    servers: many(serversTable),
}));

export type Network = typeof networksTable.$inferSelect;