import { methodsTable } from "../../../admin/method/src/schemas/method.schema";
import { serversTable } from "../../../admin/server/src/schemas/server.schema";
import { usersTable } from "../../../user/src/schemas/user.schema";
import { relations } from "drizzle-orm";
import { uuid, integer, pgTable, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

/*
=============== DBML ===============
Table attacks {
  id integer [pk]
  target text [not null]
  duration integer [not null]
  method_id integer
  user_id uuid
  server_id integer
  is_stopped bool [not null]
  options jsonb [not null]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}
=============== DBML ===============
*/

export const attacksTable = pgTable('attacks', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  target: text('target').notNull(),
  duration: integer('duration').notNull(),
  methodId: integer('method_id').references(() => methodsTable.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => usersTable.id, { onDelete: 'cascade' }),
  serverId: integer('server_id').references(() => serversTable.id, { onDelete: 'cascade' }),
  isStopped: boolean('is_stopped').notNull(),
  options: jsonb('options').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const attacksRelations = relations(attacksTable, ({ one }) => ({
  method: one(methodsTable, {
    fields: [attacksTable.methodId],
    references: [methodsTable.id],
  }),
  user: one(usersTable, {
    fields: [attacksTable.userId],
    references: [usersTable.id],
  }),
  server: one(serversTable, {
    fields: [attacksTable.serverId],
    references: [serversTable.id],
  }),
}));

export type Attack = typeof attacksTable.$inferSelect;
