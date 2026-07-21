import { relations } from 'drizzle-orm';
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { userEntity } from './user.entity';

export const ticketStatusEnum = pgEnum('ticket_status', [
  'OPEN',
  'IN_PROGRESS',
  'SOLVED',
  'CLOSED',
]);

export class TicketStatus {
  static readonly OPEN = 'OPEN';
  static readonly IN_PROGRESS = 'IN_PROGRESS';
  static readonly SOLVED = 'SOLVED';
  static readonly CLOSED = 'CLOSED';
}

export type TicketStatusValue =
  | typeof TicketStatus.OPEN
  | typeof TicketStatus.IN_PROGRESS
  | typeof TicketStatus.SOLVED
  | typeof TicketStatus.CLOSED;

export const ticketEntity = pgTable('tickets', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  status: ticketStatusEnum('status').notNull().default(TicketStatus.OPEN),
  senderId: uuid('sender_id').references(() => userEntity.id, {
    onDelete: 'set null',
  }),
  assignedSupportId: uuid('assigned_support_id').references(
    () => userEntity.id,
    { onDelete: 'set null' },
  ),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const ticketsRelations = relations(ticketEntity, ({ one }) => ({
  sender: one(userEntity, {
    relationName: 'ticket_sender',
    fields: [ticketEntity.senderId],
    references: [userEntity.id],
  }),
  assignedSupport: one(userEntity, {
    relationName: 'ticket_assigned_support',
    fields: [ticketEntity.assignedSupportId],
    references: [userEntity.id],
  }),
}));

export type Ticket = typeof ticketEntity.$inferSelect;
