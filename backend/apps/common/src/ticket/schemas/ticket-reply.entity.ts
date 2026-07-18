import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { userEntity } from '../../auth/src/entities/user.entity';
import { ticketEntity } from './ticket.entity';

export const ticketReplyEntity = pgTable('ticket_replies', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  ticketId: integer('ticket_id')
    .notNull()
    .references(() => ticketEntity.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id')
    .notNull()
    .references(() => userEntity.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type TicketReply = typeof ticketReplyEntity.$inferSelect;
