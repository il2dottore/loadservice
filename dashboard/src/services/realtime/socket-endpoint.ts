import { io, type Socket } from 'socket.io-client'

export function connectSocket(
  endpoint: string,
  options: Parameters<typeof io>[1] = {},
): Socket {
  const parsed = new URL(endpoint)
  const segments = parsed.pathname.split('/').filter(Boolean)
  if (segments.length < 2) {
    throw new Error(
      `Socket URL must include transport path and namespace: ${endpoint}`,
    )
  }
  const namespace = `/${segments.pop()}`
  const path = `/${segments.join('/')}`
  return io(`${parsed.origin}${namespace}`, {
    ...options,
    ...(path ? { path } : {}),
  })
}
