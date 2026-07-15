import { relations } from "drizzle-orm";
import { integer, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import { attackEntity } from "./attack.entity";
import { networkServerEntity } from "./network-server.entity";

export const serverEntity = pgTable('servers', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).unique().notNull(),
  address: varchar('address', { length: 255 }).unique().notNull(),
  slots: integer('slots').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const serversRelations = relations(serverEntity, ({ many }) => ({
  networkServers: many(networkServerEntity),
  attacks: many(attackEntity),
}));

export type Server = typeof serverEntity.$inferSelect;
