import { usersTable } from '@modules/user/schemas/user.schema';
import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/*
=============== DBML ===============
Table news {
  id integer [pk]
  title text [not null]
  content text [not null]
  author_id uuid
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}
=============== DBML ===============
*/

export const newsTable = pgTable('news', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: uuid('author_id').references(() => usersTable.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const newsRelations = relations(newsTable, ({ one }) => ({
  author: one(usersTable, {
    fields: [newsTable.authorId],
    references: [usersTable.id]
  })
}));

export type News = typeof newsTable.$inferSelect;
