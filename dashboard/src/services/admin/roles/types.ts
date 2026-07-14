export interface Role {
  key: string
  displayName: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface Permission {
  key: string
  displayName: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface RoleQueryRow {
  roles: Role
  roles_permissions: { roleKey: string; permissionKey: string } | null
  permissions: Permission | null
  users_roles: { roleKey: string; userId: string } | null
  users: { id: string; firstName: string; lastName: string } | null
}
