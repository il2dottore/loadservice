import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  assignPermissionToRole,
  createPermission,
  createRole,
  deletePermission,
  deleteRole,
  fetchPermissions,
  fetchRoleById,
  fetchRoles,
  removePermissionFromRole,
  updatePermission,
  updateRole,
} from '@/services/admin/roles/role.service'

/* ───── Roles ───── */

const rolesKey = ['admin', 'roles'] as const

export function useRoles() {
  return useQuery({
    queryKey: [...rolesKey, 'list'],
    queryFn: fetchRoles,
  })
}

export function useRoleById(id: number | null) {
  return useQuery({
    queryKey: [...rolesKey, 'detail', id],
    queryFn: () => fetchRoleById(id!),
    enabled: id !== null,
    select: (data) => {
      const perms = data
        .map((row) => row.permissions?.id)
        .filter((p): p is string => !!p)
      return { role: data[0]?.roles ?? null, permissionIds: [...new Set(perms)] }
    },
  })
}

export function useCreateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => createRole(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: rolesKey }),
  })
}

export function useUpdateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => updateRole(id, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: rolesKey }),
  })
}

export function useDeleteRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteRole(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: rolesKey }),
  })
}

/* ───── Role-Permission assignments ───── */

export function useAssignPermission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleKey: string; permissionId: string }) =>
      assignPermissionToRole(roleId, permissionId),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: [...rolesKey, 'detail', vars.roleId] }),
  })
}

export function useRemovePermission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleKey: string; permissionId: string }) =>
      removePermissionFromRole(roleId, permissionId),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: [...rolesKey, 'detail', vars.roleId] }),
  })
}

/* ───── Permissions ───── */

const permissionsKey = ['admin', 'permissions'] as const

export function usePermissions() {
  return useQuery({
    queryKey: permissionsKey,
    queryFn: fetchPermissions,
  })
}

export function useCreatePermission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => createPermission(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: permissionsKey }),
  })
}

export function useUpdatePermission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, newId }: { id: string; newId: string }) => updatePermission(id, newId),
    onSuccess: () => qc.invalidateQueries({ queryKey: permissionsKey }),
  })
}

export function useDeletePermission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePermission(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: permissionsKey }),
  })
}
