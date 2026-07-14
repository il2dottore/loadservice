import { relations } from 'drizzle-orm';
import { userEntity } from './user.entity';
import { userRoleEntity } from './user-role.entity';
import { usersPlansTable } from '../../../plan/src/entities/plan.entity';
import { newsTable } from '../../../news/src/schemas/news.schema';
import { ticketsTable } from '../../../ticket/src/schemas/ticket.schema';

export const usersRelations = relations(userEntity, ({ many }) => ({
  userRoles: many(userRoleEntity),
  userPlans: many(usersPlansTable),
  news: many(newsTable),
  sentTickets: many(ticketsTable, { relationName: 'ticket_sender' }),
  assignedTickets: many(ticketsTable, {
    relationName: 'ticket_assigned_support',
  }),
}));
