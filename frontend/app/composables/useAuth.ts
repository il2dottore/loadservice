import { normalizeAuthUser, normalizeUserDetails } from '~/utils/admin'
import type { AdminManagedUser, AuthSession, AuthUser } from '~/types'

export const useAuth = () => {
  const session = useCookie<AuthSession | null>('auth-session', {
    default: () => null,
    sameSite: 'lax'
  })
  const auth = useState<AuthSession>('auth-session', () => session.value ?? {
    user: null,
    accessToken: null,
    refreshToken: null,
    sessionId: null
  })
  const profileLoaded = useState('auth-profile-loaded', () => false)

  const user = computed(() => auth.value.user)
  const isAuthenticated = computed(() => !!auth.value.accessToken && !!auth.value.user)
  const roles = computed(() => user.value?.roles ?? [])
  const isAdmin = computed(() => roles.value.includes('ADMINISTRATOR'))

  function setSession(nextSession: AuthSession) {
    const nextUser = normalizeAuthUser(nextSession.user)

    auth.value = {
      ...nextSession,
      user: nextUser
    }
    session.value = nextUser ? auth.value : null
    profileLoaded.value = !!nextUser?.roles.length
  }

  function setUser(nextUser: AuthUser) {
    setSession({
      ...auth.value,
      user: nextUser
    })
  }

  function clearSession() {
    auth.value = {
      user: null,
      accessToken: null,
      refreshToken: null,
      sessionId: null
    }
    session.value = null
    profileLoaded.value = false
  }

  async function refreshProfile(options?: { force?: boolean }) {
    if (!auth.value.user?.id) {
      return null
    }

    if (profileLoaded.value && !options?.force) {
      return auth.value.user
    }

    const rows = await $fetch<any[]>(`/api/users/${auth.value.user.id}`)
    const normalizedUser = normalizeUserDetails(rows, auth.value.user as Partial<AdminManagedUser>)

    if (normalizedUser) {
      setUser(normalizedUser)
      profileLoaded.value = true
    }

    return normalizedUser
  }

  function hasRole(role: string) {
    return roles.value.includes(role)
  }

  async function logout(options?: { skipRequest?: boolean }) {
    const currentSession = auth.value

    if (!options?.skipRequest && currentSession.user?.id && currentSession.sessionId) {
      try {
        await $fetch('/api/auth/logout', {
          method: 'POST',
          body: {
            userId: currentSession.user.id,
            sessionId: currentSession.sessionId
          }
        })
      }
      catch {
      }
    }

    clearSession()
    await navigateTo('/login')
  }

  async function logoutAll() {
    const currentSession = auth.value

    if (currentSession.user?.id) {
      await $fetch('/api/auth/logout-all', {
        method: 'POST',
        body: {
          userId: currentSession.user.id
        }
      })
    }

    clearSession()
    await navigateTo('/login')
  }

  return {
    auth: readonly(auth),
    user,
    isAuthenticated,
    roles,
    isAdmin,
    setSession,
    setUser,
    refreshProfile,
    hasRole,
    logout,
    logoutAll
  }
}
