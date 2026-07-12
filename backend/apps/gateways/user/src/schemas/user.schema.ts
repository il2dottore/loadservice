import { attacksTable } from '../../../attack/src/schemas/attack.schema';
import { newsTable } from '../../../news/src/schemas/news.schema';
import { usersPlansTable } from '../../../admin/plan/src/schemas/plan.schema';
import { usersRolesTable } from '../../../admin/role/src/schemas/user-role.schema';
import { ticketsTable } from '../../../ticket/src/schemas/ticket.schema';
import { relations } from 'drizzle-orm';
import { boolean, varchar } from 'drizzle-orm/pg-core';
import { pgTable, timestamp, uuid, text } from 'drizzle-orm/pg-core';

/*
=============== DBML ===============
Table users {
  id uuid [pk]
  first_name varchar(50) [not null]
  last_name varchar(50) [not null]
  username varchar(50) [unique, not null]
  password text [not null]
  phone_number varchar(50) [unique, not null]
  email varchar [unique, not null]
  email_verified boolean [not null]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}
=============== DBML ===============
*/

export const usersTable = pgTable('users', {
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

export const usersRelations = relations(usersTable, ({ many }) => ({
  attacks: many(attacksTable),
  userRoles: many(usersRolesTable),
  userPlans: many(usersPlansTable),
  news: many(newsTable),
  sentTickets: many(ticketsTable, { relationName: 'ticket_sender' }),
  assignedTickets: many(ticketsTable, { relationName: 'ticket_assigned_support' }),
}));

export type User = typeof usersTable.$inferSelect;
