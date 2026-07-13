import { api } from '@/lib/axios'
import { endpoints } from '@/constants/endpoints'
import type { Permission, Role, RoleQueryRow } from './types'

/* ───── Roles ───── */

export async function fetchRoles(): Promise<Role[]> {
  const { data } = await api.get<Role[]>(endpoints.admin.role.list)
  return data
}

export async function fetchRoleById(id: number): Promise<RoleQueryRow[]> {
  const { data } = await api.get<RoleQueryRow[]>(endpoints.admin.role.byId(id))
  return data
}

export async function createRole(name: string): Promise<Role> {
  const { data } = await api.post<Role>(endpoints.admin.role.create, { name })
  return data
}

export async function updateRole(id: number, name: string): Promise<Role> {
  const { data } = await api.put<Role>(endpoints.admin.role.update(id), {
    name,
  })
  return data
}

export async function deleteRole(id: number): Promise<unknown> {
  const { data } = await api.delete(endpoints.admin.role.delete(id))
  return data
}

/* ───── Role-Permission assignments ───── */

export async function assignPermissionToRole(
  roleKey: string,
  permissionId: string
): Promise<unknown> {
  const { data } = await api.post(
    endpoints.admin.role.permissions.create(roleId, permissionId),
    {
      permissionId,
    }
  )
  return data
}

export async function removePermissionFromRole(
  roleKey: string,
  permissionId: string
): Promise<unknown> {
  const { data } = await api.delete(
    endpoints.admin.role.permissions.delete(roleId, permissionId)
  )
  return data
}

/* ───── Permissions ───── */

export async function fetchPermissions(): Promise<Permission[]> {
  const { data } = await api.get<Permission[]>(endpoints.admin.permission.list)
  return data
}

export async function createPermission(id: string): Promise<Permission> {
  const { data } = await api.post<Permission>(
    endpoints.admin.permission.create,
    {
      id,
    }
  )
  return data
}

export async function updatePermission(
  id: string,
  newId: string
): Promise<Permission> {
  const { data } = await api.put<Permission>(
    endpoints.admin.permission.update(id),
    {
      id: newId,
    }
  )
  return data
}

export async function deletePermission(id: string): Promise<unknown> {
  const { data } = await api.delete(endpoints.admin.permission.delete(id))
  return data
}
