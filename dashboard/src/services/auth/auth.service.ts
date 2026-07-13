import { api } from '@/lib/axios'
import { endpoints } from '@/constants/endpoints'
import type {
  AuthResponse,
  AuthUser,
  Session,
  SignInInput,
  SignUpInput,
  UpdateProfileInput,
} from './types'

export async function signIn(input: SignInInput): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(endpoints.auth.login, input)
  return data
}

export async function signUp(input: SignUpInput): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(endpoints.auth.register, input)
  return data
}

export async function getProfile(accessToken: string): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>(endpoints.auth.me, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return data
}

export async function updateProfile(
  accessToken: string,
  input: UpdateProfileInput
): Promise<AuthUser> {
  const { data } = await api.patch<AuthUser>(endpoints.auth.me, input, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return data
}

export async function getSessions(
  accessToken: string,
  userId: string
): Promise<Session[]> {
  const { data } = await api.get<Session[]>(endpoints.auth.sessions(userId), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return data
}

export async function revokeSession(
  accessToken: string,
  userId: string,
  sessionId: string
): Promise<{ success: boolean }> {
  const { data } = await api.post<{ success: boolean }>(
    endpoints.auth.logout,
    { userId, sessionId },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  return data
}

export async function revokeAllSessions(
  accessToken: string,
  userId: string
): Promise<{ success: boolean }> {
  const { data } = await api.post<{ success: boolean }>(
    endpoints.auth.logoutAll,
    { userId },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  return data
}
