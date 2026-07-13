import { relations } from 'drizzle-orm';
import { integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { userEntity } from '../../../auth/src/entities/user.entity';

/*
=============== DBML ===============
Table tickets {
  id integer [pk]
  title text [not null]
  content text [not null]
  status enum(OPEN, IN_PROGRESS, SOLVED)
  sender_id uuid
  assgined_support_id uuid
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}
=============== DBML ===============
*/

export const ticketStatusEnum = pgEnum('ticket_status', ['OPEN', 'IN_PROGRESS', 'SOLVED']);

export class TicketStatus {
  static readonly OPEN = 'OPEN';
  static readonly IN_PROGRESS = 'IN_PROGRESS';
  static readonly SOLVED = 'SOLVED';
}

export type TicketStatusValue =
  | typeof TicketStatus.OPEN
  | typeof TicketStatus.IN_PROGRESS
  | typeof TicketStatus.SOLVED;

export const ticketsTable = pgTable('tickets', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  status: ticketStatusEnum('status').notNull().default(TicketStatus.OPEN),
  senderId: uuid('sender_id').references(() => userEntity.id, { onDelete: 'set null' }),
  assignedSupportId: uuid('assgined_support_id').references(() => userEntity.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const ticketsRelations = relations(ticketsTable, ({ one }) => ({
  sender: one(userEntity, {
    relationName: 'ticket_sender',
    fields: [ticketsTable.senderId],
    references: [userEntity.id]
  }),
  assignedSupport: one(userEntity, {
    relationName: 'ticket_assigned_support',
    fields: [ticketsTable.assignedSupportId],
    references: [userEntity.id]
  })
}));

export type Ticket = typeof ticketsTable.$inferSelect;
