import { relations } from 'drizzle-orm';
import { userEntity } from './user.entity';
import { userRoleEntity } from './user-role.entity';
import { newsEntity } from './news.entity';
import { usersPlansTable } from './plan.entity';
import { ticketEntity } from './ticket.entity';

export const usersRelations = relations(userEntity, ({ many }) => ({
  userRoles: many(userRoleEntity),
  userPlans: many(usersPlansTable),
  news: many(newsEntity),
  sentTickets: many(ticketEntity, { relationName: 'ticket_sender' }),
  assignedTickets: many(ticketEntity, {
    relationName: 'ticket_assigned_support',
  }),
}));
