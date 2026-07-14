export interface AuthUser {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber?: string | null
  emailVerified?: boolean
  createdAt?: string
  updatedAt?: string
  roles?: { key: string; displayName: string; description?: string }[]
  permissions?: string[]
  plans?: {
    id: number
    name: string
    price: number
    maxDuration: number
    maxConcurrents: number
    isCustom: boolean
    planFeatures: { id: string; name: string }[]
  }[]
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
  sessionId: string
}

export interface SignInInput {
  username: string
  password: string
}

export interface SignUpInput {
  email: string
  password: string
  firstName: string
  lastName: string
  username: string
}

export interface UpdateProfileInput {
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber?: string | null
}

export interface Session {
  sessionId: string
  ipAddress: string
  userAgent: string
  deviceName: string
  deviceKind: 'desktop' | 'mobile' | 'tablet'
  createdAt: string
  lastActive: string
}
