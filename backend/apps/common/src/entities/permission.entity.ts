import { relations } from 'drizzle-orm';
import { pgTable, primaryKey, timestamp, varchar } from 'drizzle-orm/pg-core';
import { roleEntity } from './role.entity';
import { text } from 'drizzle-orm/pg-core';

export const permissionEntity = pgTable('permissions', {
  key: varchar('key', { length: 255 }).primaryKey(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  description: text().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const rolePermissionEntity = pgTable(
  'roles_permissions',
  {
    roleKey: varchar('role_key')
      .notNull()
      .references(() => roleEntity.key),
    permissionKey: varchar('permission_key', { length: 255 })
      .notNull()
      .references(() => permissionEntity.key),
  },
  (table) => {
    return [
      primaryKey({
        columns: [table.roleKey, table.permissionKey],
      }),
    ];
  },
);

export const rolesPermissionsRelations = relations(
  rolePermissionEntity,
  ({ one }) => ({
    role: one(roleEntity, {
      fields: [rolePermissionEntity.roleKey],
      references: [roleEntity.key],
    }),
    permission: one(permissionEntity, {
      fields: [rolePermissionEntity.permissionKey],
      references: [permissionEntity.key],
    }),
  }),
);

export type Permission = typeof permissionEntity.$inferSelect;
export type RolePermission = typeof rolePermissionEntity.$inferSelect;
