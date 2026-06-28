import type { H3Event } from 'h3'
import type { AuthSession } from '~/types'

function readSession(event: H3Event): AuthSession | null {
  const cookie = getCookie(event, 'auth-session')

  if (!cookie) {
    return null
  }

  try {
    return JSON.parse(decodeURIComponent(cookie)) as AuthSession
  }
  catch {
    return null
  }
}

export function requireAdminSession(event: H3Event) {
  const session = readSession(event)

  if (!session?.user || !session.user.roles.includes('ADMINISTRATOR')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Administrator access required.'
    })
  }

  return session
}

export function requireSelfOrAdminSession(event: H3Event, userId: string) {
  const session = readSession(event)

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required.'
    })
  }

  if (session.user.id !== userId && !session.user.roles.includes('ADMINISTRATOR')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You are not allowed to access this user.'
    })
  }

  return session
}
