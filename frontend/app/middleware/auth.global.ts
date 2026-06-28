export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, refreshProfile } = useAuth()
  const publicRoutes = ['/', '/login', '/register']

  if (!isAuthenticated.value && !publicRoutes.includes(to.path)) {
    return navigateTo('/login')
  }

  if (isAuthenticated.value && ['/login', '/register'].includes(to.path)) {
    return navigateTo('/home')
  }

  if (isAuthenticated.value && !publicRoutes.includes(to.path)) {
    try {
      await refreshProfile()
    }
    catch {
    }
  }
})
