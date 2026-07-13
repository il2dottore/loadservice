import type { AuthUser } from '@/features/auth/api/types'

export interface AdminRoleDetail {
  id: number
  name: string
}

export interface AdminPlanDetail {
  id: number
  name: string
  price: number
  maxDuration: number
  maxConcurrents: number
  isCustom: boolean
  planFeatures: { id: string; name: string }[]
}

export interface AdminUserDetails {
  user: AuthUser
  roles: AdminRoleDetail[]
  roles_permissions: { permission_id: string }[]
  plans: AdminPlanDetail[]
}

export interface ApiListResponse<T> {
  success: boolean
  message: string
  statusCode: number
  data: T
}

export interface UpdateUserInput {
  firstName?: string
  lastName?: string
  username?: string
  email?: string
  phoneNumber?: string | null
}
