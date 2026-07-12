import { useCallback, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiKey } from './types'
import {
  fetchApiKeys,
  createApiKey as createKey,
  renameApiKey as renameKey,
  removeApiKey as removeKey,
  fetchSessions,
  revokeSession as revokeSessionApi,
  revokeAllSessions as revokeAllApi,
} from './api'

const sessionsQueryKey = ['auth', 'sessions'] as const

// --- Api Keys (mock) ---

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>(fetchApiKeys)

  const create = useCallback(
    (name: string) => {
      const key = createKey(name)
      setKeys(fetchApiKeys())
      return key
    },
    [],
  )

  const rename = useCallback(
    (id: string, name: string) => {
      const updated = renameKey(id, name)
      if (updated) setKeys(fetchApiKeys())
      return updated
    },
    [],
  )

  const remove = useCallback(
    (id: string) => {
      removeKey(id)
      setKeys(fetchApiKeys())
    },
    [],
  )

  return { keys, create, rename, remove }
}

// --- Sessions ---

export function useSessions(accessToken: string, userId: string) {
  return useQuery({
    queryKey: [...sessionsQueryKey, userId],
    queryFn: () => fetchSessions(accessToken, userId),
    enabled: Boolean(accessToken) && Boolean(userId),
  })
}

export function useRevokeSession(accessToken: string, userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) => revokeSessionApi(accessToken, userId, sessionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sessionsQueryKey }),
  })
}

export function useRevokeAllSessions(accessToken: string, userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => revokeAllApi(accessToken, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sessionsQueryKey }),
  })
}
