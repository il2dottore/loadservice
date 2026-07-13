import { newsTable } from '../../../news/src/schemas/news.schema';
import { usersPlansTable } from '../../../plan/src/entities/plan.entity';
import { userRoleEntity } from './user-role.entity';
import { relations } from 'drizzle-orm';
import { boolean, varchar } from 'drizzle-orm/pg-core';
import { pgTable, timestamp, uuid, text } from 'drizzle-orm/pg-core';
import { ticketsTable } from '../../../ticket/src/schemas/ticket.schema';

export const userEntity = pgTable('users', {
  id: uuid().defaultRandom().primaryKey(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: text('password').notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }).unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(userEntity, ({ many }) => ({
  userRoles: many(userRoleEntity),
  userPlans: many(usersPlansTable),
  news: many(newsTable),
  sentTickets: many(ticketsTable, { relationName: 'ticket_sender' }),
  assignedTickets: many(ticketsTable, {
    relationName: 'ticket_assigned_support',
  }),
}));

export type User = typeof userEntity.$inferSelect;
