import type { AuthUser } from '@/services/auth/types'
import { api } from '@/lib/axios'
import { endpoints } from '@/constants/endpoints'
import type { AdminUserDetails, UpdateUserInput } from './types'

export async function fetchAdminUsers(
  perPage: number,
  page: number
): Promise<AdminUserDetails[]> {
  const { data } = await api.get<AdminUserDetails[]>(
    endpoints.admin.user.list,
    {
      params: { perPage, page },
    }
  )
  return data
}

export async function fetchAdminUserCount(): Promise<number> {
  const { data } = await api.get<{ count: number }>(endpoints.admin.user.count)
  return data.count
}

export async function fetchAdminUserDetails(
  id: string
): Promise<AdminUserDetails> {
  const { data } = await api.get<AdminUserDetails>(
    endpoints.admin.user.details(id)
  )
  return data
}

export async function updateAdminUser(
  id: string,
  input: UpdateUserInput
): Promise<AuthUser> {
  const { data } = await api.put<AuthUser>(
    endpoints.admin.user.update(id),
    input
  )
  return data
}

export async function deleteAdminUser(id: string): Promise<AuthUser> {
  const { data } = await api.delete<AuthUser>(endpoints.admin.user.delete(id))
  return data
}
