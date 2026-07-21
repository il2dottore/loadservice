import {
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  pgTable,
} from 'drizzle-orm/pg-core';
import { userEntity } from './user.entity';

export const oauthAccountEntity = pgTable(
  'oauth_accounts',
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => userEntity.id, { onDelete: 'cascade' }),
    provider: varchar('provider', { length: 50 }).notNull(),
    providerAccountId: varchar('provider_account_id', {
      length: 255,
    }).notNull(),
    email: varchar('email', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    providerAccountUnique: uniqueIndex('oauth_provider_account_unique').on(
      table.provider,
      table.providerAccountId,
    ),
    userProviderUnique: uniqueIndex('oauth_user_provider_unique').on(
      table.userId,
      table.provider,
    ),
  }),
);

export type OAuthAccount = typeof oauthAccountEntity.$inferSelect;
