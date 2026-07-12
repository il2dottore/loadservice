import { serversTable } from "@modules/admin/server/schemas/server.schema";
import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, primaryKey, varchar, timestamp } from "drizzle-orm/pg-core";

/*
=============== DBML ===============
Table networks {
  id integer [pk]
  name varchar(255) [unique, not null]
  vip_access bool [not null]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`] 
}

Table networks_servers {
  network_id integer
  server_id integer
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}
=============== DBML ===============
*/

export const networksTable = pgTable('networks', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 255 }).unique().notNull(),
    vipAccess: boolean('vip_access').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const networksServersTable = pgTable('networks_servers', {
    networkId: integer('network_id').notNull().references(() => networksTable.id, { onDelete: 'cascade' }),
    serverId: integer('server_id').notNull().references(() => serversTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return [
        primaryKey({
            columns: [
                table.networkId,
                table.serverId
            ]
        })
    ];
});

export const networksRelations = relations(networksTable, ({ many }) => ({
    networkServers: many(networksServersTable),
}));

export const networksServersRelations = relations(networksServersTable, ({ one }) => ({
    network: one(networksTable, {
        fields: [networksServersTable.networkId],
        references: [networksTable.id]
    }),
    server: one(serversTable, {
        fields: [networksServersTable.serverId],
        references: [serversTable.id]
    })
}));

export type Network = typeof networksTable.$inferSelect;
