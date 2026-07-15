import { methodsTable } from "./method.entity";
import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { serverEntity } from "./server.entity";

export const attackStatusEnum = pgEnum('attack_status', [
  'QUEUED', 'SCHEDULED', 'RUNNING', 'COMPLETED',
  'FAILED', 'REJECTED', 'CANCELLED', 'TIMEOUT',
]);
export const attackEntity = pgTable('attacks', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  // Attack information
  target: text('target').notNull(),
  duration: integer('duration').notNull(),
  // Layer 4 config
  ppsLimit: integer('pps_limit'),
  port: integer('port'),
  // Layer 7 config
  rateLimit: integer('rate_limit'),
  // Only allows GET, POST, HEAD, OPTIONS
  requestMethod: varchar('request_method', { length: 10 }),
  postData: text('post_data'),
  methodId: integer('method_id').references(() => methodsTable.id, { onDelete: 'cascade' }),
  // This entity is running on an `attack` module, which will be deploy as microservice in the future
  // so, no FK `user_id` here.
  userId: uuid('user_id'),

  // Server that attack is running on
  serverId: integer('server_id').references(() => serverEntity.id, { onDelete: 'set null' }),

  /**
   * QUEUED, SCHEDULED, RUNNING, COMPLETED, FAILED, REJECTED, CANCELLED, TIMEOUT
   */
  status: attackStatusEnum('status').notNull().default('QUEUED'),
  failureReason: text('failure_reason'),
  startedAt: timestamp('started_at'),
  finishedAt: timestamp('finished_at'),
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
