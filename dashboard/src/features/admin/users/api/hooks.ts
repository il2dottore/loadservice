import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchAdminUsers,
  fetchAdminUserCount,
  fetchAdminUserDetails,
  updateAdminUser,
  deleteAdminUser,
} from './api'
import type { UpdateUserInput } from './types'

const adminUsersKey = ['admin', 'users'] as const

export function useAdminUsers(perPage: number, page: number) {
  return useQuery({
    queryKey: [...adminUsersKey, 'list', perPage, page],
    queryFn: () => fetchAdminUsers(perPage, page),
  })
}

export function useAdminUserCount() {
  return useQuery({
    queryKey: [...adminUsersKey, 'count'],
    queryFn: fetchAdminUserCount,
  })
}

export function useAdminUserDetails(id: string | null) {
  return useQuery({
    queryKey: [...adminUsersKey, 'details', id],
    queryFn: () => fetchAdminUserDetails(id!),
    enabled: !!id,
  })
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      updateAdminUser(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminUsersKey }),
  })
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAdminUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminUsersKey }),
  })
}
