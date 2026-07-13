import { useCallback, useState } from 'react'
import {
  useRevokeAllSessions,
  useRevokeSession,
  useSessions,
} from '@/features/auth/hooks/auth-hooks'
import {
  createApiKey,
  fetchApiKeys,
  removeApiKey,
  renameApiKey,
} from '@/services/security/security.service'
import type { ApiKey } from '@/services/security/types'

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>(fetchApiKeys)

  const create = useCallback((name: string) => {
    const key = createApiKey(name)
    setKeys(fetchApiKeys())
    return key
  }, [])

  const rename = useCallback((id: string, name: string) => {
    const updated = renameApiKey(id, name)
    if (updated) setKeys(fetchApiKeys())
    return updated
  }, [])

  const remove = useCallback((id: string) => {
    removeApiKey(id)
    setKeys(fetchApiKeys())
  }, [])

  return { keys, create, rename, remove }
}

export { useSessions, useRevokeSession, useRevokeAllSessions }
