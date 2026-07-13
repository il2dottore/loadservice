import { Outlet, createFileRoute } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
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

  const isAdmin = user?.roles?.some((r) => /admin|owner/i.test(r.name))
  if (!isAdmin) {
    return <NotFoundError />
  }

  return <Outlet />
}

export const Route = createFileRoute('/_authenticated/admin')({
  component: AdminGuard,
})
