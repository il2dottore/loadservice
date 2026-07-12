import { networksServersTable } from "../../../network/src/schemas/network.schema";
import { attacksTable } from "../../../../attack/src/schemas/attack.schema";
import { relations } from "drizzle-orm";
import { integer, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

/*
=============== DBML ===============
Table servers {
  id integer [pk]
  name varchar(255) [unique, not null]
  address varchar(255) [unique, not null]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}
=============== DBML ===============
*/

export const serversTable = pgTable('servers', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 255 }).unique().notNull(),
    address: varchar('address', { length: 255 }).unique().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const serversRelations = relations(serversTable, ({ many }) => ({
    networkServers: many(networksServersTable),
    attacks: many(attacksTable),
}));

export type Server = typeof serversTable.$inferSelect;
