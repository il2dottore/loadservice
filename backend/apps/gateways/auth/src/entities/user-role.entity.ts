import { roleEntity } from './role.entity';
import { relations } from 'drizzle-orm';
import {
  pgTable,
  primaryKey,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { userEntity } from './user.entity';

export const userRoleEntity = pgTable(
  'users_roles',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => userEntity.id, { onDelete: 'cascade' }),
    roleKey: varchar('role_key', { length: 255 })
      .notNull()
      .references(() => roleEntity.key),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => {
    return [
      primaryKey({
        columns: [table.userId, table.roleKey],
      }),
    ];
  },
);

export const usersRolesRelations = relations(userRoleEntity, ({ one }) => ({
  user: one(userEntity, {
    fields: [userRoleEntity.userId],
    references: [userEntity.id],
  }),
  role: one(roleEntity, {
    fields: [userRoleEntity.roleKey],
    references: [roleEntity.key],
  }),
}));

export type UserRole = typeof userRoleEntity.$inferSelect;
