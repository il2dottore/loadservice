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
  roles_permissions: { roleId: number; permissionId: string } | null
  permissions: Permission | null
  users_roles: { roleId: number; userId: string } | null
  users: { id: string; firstName: string; lastName: string } | null
}
