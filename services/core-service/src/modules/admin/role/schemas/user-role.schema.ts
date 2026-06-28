import { rolesTable } from '@modules/admin/role/schemas/role.schema';
import { usersTable } from '@modules/user/schemas/user.schema';
import { relations } from 'drizzle-orm';
import { pgTable, primaryKey, timestamp, uuid, integer } from 'drizzle-orm/pg-core';

/*
=============== DBML ===============
Table users_roles {
  user_id uuid
  role_id int
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}
=============== DBML ===============
*/

export const usersRolesTable = pgTable('users_roles', {
  userId: uuid('user_id').notNull().references(() => usersTable.id),
  roleId: integer('role_id').notNull().references(() => rolesTable.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return [
    primaryKey({
      columns: [
        table.userId,
        table.roleId
      ]
    })
  ];
});

export const usersRolesRelations = relations(usersRolesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [usersRolesTable.userId],
    references: [usersTable.id]
  }),
  role: one(rolesTable, {
    fields: [usersRolesTable.roleId],
    references: [rolesTable.id]
  })
}));

export type UserRole = typeof usersRolesTable.$inferSelect;
