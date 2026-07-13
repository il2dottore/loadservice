import { boolean, integer, pgTable, primaryKey, varchar, timestamp } from "drizzle-orm/pg-core";

export const networkEntity = pgTable('networks', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).unique().notNull(),
  vipAccess: boolean('vip_access').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Network = typeof networkEntity.$inferSelect;
