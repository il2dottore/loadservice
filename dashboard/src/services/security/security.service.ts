import type { ApiKey } from './types'

const MOCK_KEYS: ApiKey[] = [
  {
    id: 'key_live_1',
    name: 'Production sync worker',
    prefix: 'sk_live_a4d9',
    lastUsed: '2 minutes ago',
    createdAt: 'Jul 8, 2026',
    scopes: ['read:orders', 'write:webhooks'],
  },
  {
    id: 'key_test_2',
    name: 'Internal dashboard',
    prefix: 'sk_test_b73f',
    lastUsed: 'Yesterday',
    createdAt: 'Jul 2, 2026',
    scopes: ['read:users', 'read:logs'],
  },
  {
    id: 'key_cli_3',
    name: 'CLI experiments',
    prefix: 'sk_dev_c91k',
    lastUsed: 'Never',
    createdAt: 'Jun 29, 2026',
    scopes: ['read:users'],
  },
]

let apiKeys = [...MOCK_KEYS]

export function decodeToken(token: string): { sub: string; sessionId: string } | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')))
    return decoded.sub && decoded.sessionId ? { sub: decoded.sub, sessionId: decoded.sessionId } : null
  } catch {
    return null
  }
}

export function maskKey(prefix: string): string {
  return `${prefix}................`
}

export function fetchApiKeys(): ApiKey[] {
  return [...apiKeys]
}

export function createApiKey(name: string): ApiKey {
  const key: ApiKey = {
    id: `key_mock_${crypto.randomUUID()}`,
    name,
    prefix: `sk_live_${Math.random().toString(36).slice(2, 6)}`,
    lastUsed: 'Never',
    createdAt: 'Just now',
    scopes: ['read:users'],
  }
  apiKeys = [key, ...apiKeys]
  return key
}

export function renameApiKey(id: string, name: string): ApiKey | null {
  const index = apiKeys.findIndex((key) => key.id === id)
  if (index === -1) return null
  apiKeys[index] = { ...apiKeys[index], name }
  return apiKeys[index]
}

export function removeApiKey(id: string): void {
  apiKeys = apiKeys.filter((key) => key.id !== id)
}
