export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin')) {
    return
  }

  const { isAuthenticated, refreshProfile, isAdmin } = useAuth()

  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }

  try {
    await refreshProfile()
  }
  catch {
    return navigateTo('/home')
  }

  if (!isAdmin.value) {
    return navigateTo('/home')
  }
})
