import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getProfile, getSessions, revokeSession, revokeAllSessions, signIn, signUp, updateProfile } from './auth-api'
import type { SignInInput, SignUpInput, UpdateProfileInput } from './types'

export const profileQueryKey = ['auth', 'profile'] as const
export const sessionsQueryKey = ['auth', 'sessions'] as const

export const useSignIn = () => useMutation({ mutationFn: (input: SignInInput) => signIn(input) })
export const useSignUp = () => useMutation({ mutationFn: (input: SignUpInput) => signUp(input) })
export const useProfile = (accessToken: string) => useQuery({ queryKey: profileQueryKey, queryFn: () => getProfile(accessToken), enabled: Boolean(accessToken) })
export function useUpdateProfile(accessToken: string) {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: (input: UpdateProfileInput) => updateProfile(accessToken, input), onSuccess: (profile) => queryClient.setQueryData(profileQueryKey, profile) })
}

export function useSessions(accessToken: string, userId: string) {
  return useQuery({
    queryKey: [...sessionsQueryKey, userId],
    queryFn: () => getSessions(accessToken, userId),
    enabled: Boolean(accessToken) && Boolean(userId),
  })
}

export function useRevokeSession(accessToken: string, userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) => revokeSession(accessToken, userId, sessionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sessionsQueryKey }),
  })
}

export function useRevokeAllSessions(accessToken: string, userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => revokeAllSessions(accessToken, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sessionsQueryKey }),
  })
}
