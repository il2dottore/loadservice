import type { AvatarProps } from '@nuxt/ui'

export type UserStatus = 'subscribed' | 'unsubscribed' | 'bounced'
export type SaleStatus = 'paid' | 'failed' | 'refunded'

export interface AuthUser {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber?: string | null
  emailVerified: boolean
  roles: string[]
  createdAt?: string
  updatedAt?: string
}

export interface AuthSession {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  sessionId: string | null
}

export interface ActiveSession {
  sessionId: string
}

export interface AdminPermission {
  id: string
  createdAt?: string
  updatedAt?: string
}

export interface AdminManagedUser extends AuthUser {}

export interface AdminRole {
  id: number
  name: string
  createdAt?: string
  updatedAt?: string
  permissions?: AdminPermission[]
  users?: AdminManagedUser[]
}

export interface User {
  id: number
  name: string
  email: string
  avatar?: AvatarProps
  status: UserStatus
  location: string
}

export interface Mail {
  id: number
  unread?: boolean
  from: User
  subject: string
  body: string
  date: string
}

export interface Member {
  name: string
  username: string
  role: 'member' | 'owner'
  avatar: AvatarProps
}

export interface Stat {
  title: string
  icon: string
  value: number | string
  variation: number
  formatter?: (value: number) => string
}

export interface Sale {
  id: string
  date: string
  status: SaleStatus
  email: string
  amount: number
}

export interface Notification {
  id: number
  unread?: boolean
  sender: User
  body: string
  date: string
}

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}
