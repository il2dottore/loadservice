import { api } from '@/lib/axios'
import { endpoints } from '@/constants/endpoints'
import type { Permission, Role, RoleQueryRow } from './types'

/* ───── Roles ───── */

export async function fetchRoles(): Promise<Role[]> {
  const { data } = await api.get<Role[]>(endpoints.admin.role.list)
  return data
}

export async function fetchRoleByKey(roleKey: string): Promise<RoleQueryRow[]> {
  const { data } = await api.get<RoleQueryRow[]>(
    endpoints.admin.role.byKey(roleKey)
  )
  return data
}

export async function createRole(
  key: string,
  displayName: string,
  description: string
): Promise<Role> {
  const { data } = await api.post<Role>(endpoints.admin.role.create, {
    key,
    displayName,
    description,
  })
  return data
}

export async function updateRole(
  key: string,
  displayName: string,
  description: string
): Promise<Role> {
  const { data } = await api.put<Role>(endpoints.admin.role.update(key), {
    displayName,
    description,
  })
  return data
}

export async function deleteRole(key: string): Promise<unknown> {
  const { data } = await api.delete(endpoints.admin.role.delete(key))
  return data
}

/* ───── Role-Permission assignments ───── */

export async function assignPermissionToRole(
  roleKey: string,
  permissionId: string
): Promise<unknown> {
  const { data } = await api.post(
    endpoints.admin.role.permissions.create(roleKey),
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
    endpoints.admin.role.permissions.delete(roleKey, permissionId)
  )
  return data
}

/* ───── Permissions ───── */

export async function fetchPermissions(): Promise<Permission[]> {
  const { data } = await api.get<Permission[]>(endpoints.admin.permission.list)
  return data
}

export async function createPermission(
  key: string,
  displayName: string,
  description: string
): Promise<Permission> {
  const { data } = await api.post<Permission>(
    endpoints.admin.permission.create,
    {
      key,
      displayName,
      description,
    }
  )
  return data
}

export async function updatePermission(
  key: string,
  newKey: string,
  displayName: string,
  description: string
): Promise<Permission> {
  const { data } = await api.put<Permission>(
    endpoints.admin.permission.update(key),
    {
      key: newKey,
      displayName,
      description,
    }
  )
  return data
}

export async function deletePermission(id: string): Promise<unknown> {
  const { data } = await api.delete(endpoints.admin.permission.delete(id))
  return data
}
