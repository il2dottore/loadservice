import { Outlet, createFileRoute } from '@tanstack/react-router'
import { useAuthStore } from '@/store/auth.store'
import { Loader2 } from 'lucide-react'
import { useProfile } from '@/features/auth/hooks/auth-hooks'
import { NotFoundError } from '@/features/errors/not-found-error'

function AdminGuard() {
  const { auth } = useAuthStore()
  const { data: profile, isLoading } = useProfile(auth.accessToken)
  const user = profile ?? auth.user

  if (!auth.accessToken) {
    return <NotFoundError />
  }

  if (isLoading && !user) {
    return (
      <div className='flex h-svh items-center justify-center'>
        <Loader2 className='size-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  const isAdmin = user?.roles?.some((r) =>
    ['ADMINISTRATOR', 'MANAGER'].includes(r.key.toUpperCase())
  )
  const canSupport = user?.permissions?.some((p) =>
    ['ticket:reply', 'ticket:manage'].includes(p)
  )
  if (!isAdmin && !canSupport) {
    return <NotFoundError />
  }

  return <Outlet />
}

export const Route = createFileRoute('/_authenticated/admin')({
  component: AdminGuard,
})
