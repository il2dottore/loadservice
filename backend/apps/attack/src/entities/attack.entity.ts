import { methodsTable } from "./method.entity";
import { relations } from "drizzle-orm";
import { uuid, integer, pgTable, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { serverEntity } from "./server.entity";

export const attackEntity = pgTable('attacks', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  target: text('target').notNull(),
  duration: integer('duration').notNull(),
  methodId: integer('method_id').references(() => methodsTable.id, { onDelete: 'cascade' }),
  // This entity is running on an `attack` module, which will be deploy as microservice in the future
  // so, no FK here.
  userId: uuid('user_id'),
  serverId: integer('server_id'),
  isStopped: boolean('is_stopped').notNull(),
  options: jsonb('options').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const attacksRelations = relations(attackEntity, ({ one }) => ({
  method: one(methodsTable, {
    fields: [attackEntity.methodId],
    references: [methodsTable.id],
  }),
  server: one(serverEntity, {
    fields: [attackEntity.serverId],
    references: [serverEntity.id],
  }),
}));

export type Attack = typeof attackEntity.$inferSelect;
