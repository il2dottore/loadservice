import { networksTable } from "@modules/admin/network/schemas/network.schema";
import { attacksTable } from "@modules/attack/schemas/attack.schema";
import { relations } from "drizzle-orm";
import { integer, pgTable, varchar, boolean, timestamp } from "drizzle-orm/pg-core";

/*
=============== DBML ===============
Table servers {
  id integer [pk]
  name varchar(255) [unique, not null] 
  network_id integer
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}
=============== DBML ===============
*/

export const serversTable = pgTable('servers', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 255 }).unique().notNull(),
    networkId: integer('network_id').notNull().references(() => networksTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const serversRelations = relations(serversTable, ({ one, many }) => ({
    network: one(networksTable, {
        fields: [serversTable.networkId],
        references: [networksTable.id],
    }),
    attacks: many(attacksTable),
}));

export type Server = typeof serversTable.$inferSelect;