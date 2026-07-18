import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { userEntity } from '../../auth/src/entities/user.entity';

export const newsEntity = pgTable('news', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: uuid('author_id').references(() => userEntity.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const newsRelations = relations(newsEntity, ({ one }) => ({
  author: one(userEntity, {
    fields: [newsEntity.authorId],
    references: [userEntity.id],
  }),
}));

export type News = typeof newsEntity.$inferSelect;
