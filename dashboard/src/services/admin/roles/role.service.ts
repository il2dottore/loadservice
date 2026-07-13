import { api } from '@/lib/axios'
import type { Permission, Role, RoleQueryRow } from './types'

/* ───── Roles ───── */

export function fetchRoles() {
  return api.get<Role[]>('/admin/roles').then((r) => r.data)
}

export function fetchRoleById(id: number) {
  return api.get<RoleQueryRow[]>(`/admin/roles/${id}`).then((r) => r.data)
}

export function createRole(name: string) {
  return api.post<Role>('/admin/roles/create', { name }).then((r) => r.data)
}

export function updateRole(id: number, name: string) {
  return api.put<Role>(`/admin/roles/${id}`, { name }).then((r) => r.data)
}

export function deleteRole(id: number) {
  return api.delete(`/admin/roles/${id}`).then((r) => r.data)
}

/* ───── Role-Permission assignments ───── */

export function assignPermissionToRole(roleId: number, permissionId: string) {
  return api.post(`/admin/roles/${roleId}/permissions`, { permissionId }).then((r) => r.data)
}

export function removePermissionFromRole(roleId: number, permissionId: string) {
  return api.delete(`/admin/roles/${roleId}/permissions/${permissionId}`).then((r) => r.data)
}

/* ───── Permissions ───── */

export function fetchPermissions() {
  return api.get<Permission[]>('/admin/permissions').then((r) => r.data)
}

export function createPermission(id: string) {
  return api.post<Permission>('/admin/permissions/create', { id }).then((r) => r.data)
}

export function updatePermission(id: string, newId: string) {
  return api.put<Permission>(`/admin/permissions/${id}`, { id: newId }).then((r) => r.data)
}

export function deletePermission(id: string) {
  return api.delete(`/admin/permissions/${id}`).then((r) => r.data)
}
