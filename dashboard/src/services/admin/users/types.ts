import type { AuthUser } from '@/services/auth/types'

export interface AdminRoleDetail {
  key: string
  displayName?: string
  name?: string
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

export interface UpdateUserInput {
  firstName?: string
  lastName?: string
  username?: string
  email?: string
  phoneNumber?: string | null
}
