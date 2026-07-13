export interface Role {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export interface Permission {
  id: string
  createdAt: string
  updatedAt: string
}

export interface RoleQueryRow {
  roles: Role
  roles_permissions: { roleKey: string; permissionId: string } | null
  permissions: Permission | null
  users_roles: { roleKey: string; userId: string } | null
  users: { id: string; firstName: string; lastName: string } | null
}
