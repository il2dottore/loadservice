import { api } from '@/lib/axios'
import type { ApiListResponse, AdminUserDetails, UpdateUserInput } from './types'
import type { AuthUser } from '@/features/auth/api/types'

export async function fetchAdminUsers(perPage: number, page: number): Promise<AdminUserDetails[]> {
  const { data } = await api.get<ApiListResponse<AdminUserDetails[]>>('/users/details', {
    params: { perPage, page },
  })
  return data.data
}

export async function fetchAdminUserCount(): Promise<number> {
  const { data } = await api.get<ApiListResponse<{ count: number }>>('/users/count')
  return data.data.count
}

export async function fetchAdminUserDetails(id: string): Promise<AdminUserDetails> {
  const { data } = await api.get<ApiListResponse<AdminUserDetails>>(`/users/${id}/details`)
  return data.data
}

export async function updateAdminUser(id: string, input: UpdateUserInput): Promise<AuthUser> {
  const { data } = await api.put<ApiListResponse<AuthUser>>(`/users/${id}`, input)
  return data.data
}

export async function deleteAdminUser(id: string): Promise<AuthUser> {
  const { data } = await api.delete<ApiListResponse<AuthUser>>(`/users/${id}`)
  return data.data
}
