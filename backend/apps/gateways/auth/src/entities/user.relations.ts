import { relations } from 'drizzle-orm';
import { userEntity } from './user.entity';
import { userRoleEntity } from './user-role.entity';
import { usersPlansTable } from '../../../plan/src/entities/plan.entity';
import { newsEntity } from '../../../news/src/schemas/news.entity';
import { ticketEntity } from '../../../ticket/src/schemas/ticket.entity';

export const usersRelations = relations(userEntity, ({ many }) => ({
  userRoles: many(userRoleEntity),
  userPlans: many(usersPlansTable),
  news: many(newsEntity),
  sentTickets: many(ticketEntity, { relationName: 'ticket_sender' }),
  assignedTickets: many(ticketEntity, {
    relationName: 'ticket_assigned_support',
  }),
}));
