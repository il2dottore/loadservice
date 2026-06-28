import { rolesTable } from '@modules/admin/role/schemas/role.schema';
import { relations } from 'drizzle-orm';
import { pgTable, primaryKey, timestamp, varchar, integer } from 'drizzle-orm/pg-core';

/*
=============== DBML ===============
Table permissions {
  id varchar(255) [pk]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table roles_permissions {
  role_id integer
  permission_id varchar(255)
}
=============== DBML ===============
*/

export const permissionsTable = pgTable('permissions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const rolesPermissionsTable = pgTable('roles_permissions', {
  roleId: integer('role_id').notNull().references(() => rolesTable.id),
  permissionId: varchar('permission_id', { length: 255 }).notNull().references(() => permissionsTable.id),
}, (table) => {
  return [
    primaryKey({
      columns: [
        table.roleId,
        table.permissionId
      ]
    })
  ];
});

export const rolesPermissionsRelations = relations(rolesPermissionsTable, ({ one }) => ({
  role: one(rolesTable, {
    fields: [rolesPermissionsTable.roleId],
    references: [rolesTable.id]
  }),
  permission: one(permissionsTable, {
    fields: [rolesPermissionsTable.permissionId],
    references: [permissionsTable.id]
  })
}));

export type Permission = typeof permissionsTable.$inferSelect;
export type RolePermission = typeof rolesPermissionsTable.$inferSelect;
