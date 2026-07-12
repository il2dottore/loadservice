import { api } from '@/lib/axios'
import type { AuthResponse, AuthUser, Session, SignInInput, SignUpInput, UpdateProfileInput } from './types'

export async function signIn(input: SignInInput) {
  const { data } = await api.post<AuthResponse>('/auth/login', input)
  return data
}

export async function signUp(input: SignUpInput) {
  const { data } = await api.post<AuthResponse>('/auth/register', input)
  return data
}

export async function getProfile(accessToken: string) {
  const { data } = await api.get<AuthUser>('/auth/me', { headers: { Authorization: `Bearer ${accessToken}` } })
  return data
}

export async function updateProfile(accessToken: string, input: UpdateProfileInput) {
  const { data } = await api.patch<AuthUser>('/auth/me', input, { headers: { Authorization: `Bearer ${accessToken}` } })
  return data
}

export async function getSessions(accessToken: string, userId: string) {
  const { data } = await api.get<Session[]>(`/auth/sessions/${userId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return data
}

export async function revokeSession(accessToken: string, userId: string, sessionId: string) {
  const { data } = await api.post<{ success: boolean }>(
    '/auth/logout',
    { userId, sessionId },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
  return data
}

export async function revokeAllSessions(accessToken: string, userId: string) {
  const { data } = await api.post<{ success: boolean }>(
    '/auth/logout-all',
    { userId },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
  return data
}
