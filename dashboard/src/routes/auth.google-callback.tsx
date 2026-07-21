import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { getProfile } from '@/services/auth/auth.service'
import { useAuthStore } from '@/store/auth.store'
import { toast } from 'sonner'
import { profileQueryKey } from '@/features/auth/hooks/auth-hooks'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'

function GoogleCallback() {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.auth.setUser)
  const setAccessToken = useAuthStore((state) => state.auth.setAccessToken)
  const setRefreshToken = useAuthStore((state) => state.auth.setRefreshToken)
  const reset = useAuthStore((state) => state.auth.reset)
  const queryClient = useQueryClient()
  const searchParams = new URLSearchParams(window.location.search)
  const error = searchParams.get('error') ?? ''
  const errorCode = searchParams.get('errorCode') ?? 'not-connected'

  useEffect(() => {
    if (error) return
    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get('accessToken')
    const refreshToken = params.get('refreshToken')
    if (!accessToken || !refreshToken) {
      navigate({ to: '/sign-in' })
      return
    }
    setAccessToken(accessToken)
    setRefreshToken(refreshToken)
    void getProfile(accessToken)
      .then((profile) => {
        setUser(profile)
        queryClient.setQueryData([...profileQueryKey, accessToken], profile)
        navigate({ to: '/settings' })
      })
      .catch(() => {
        reset()
        toast.error('Google sign-in failed. Please try again.')
        navigate({ to: '/sign-in' })
      })
  }, [error, navigate, queryClient, reset, setAccessToken, setRefreshToken, setUser])

  if (error) {
    return (
      <main className='flex min-h-screen items-center justify-center bg-muted/30 p-6'>
        <section className='w-full max-w-md rounded-xl border bg-background p-8 text-center shadow-sm'>
          <div className='mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-xl'>
            !
          </div>
          <h1 className='text-xl font-semibold'>
            {['already-linked', 'link-already-linked'].includes(errorCode)
              ? 'Google account already linked'
              : 'Google account not connected'}
          </h1>
          <p className='mt-2 text-sm text-muted-foreground'>
            {['already-linked', 'link-already-linked'].includes(errorCode)
              ? 'This Google account is already linked to another LoadService account.'
              : 'This Google account is not linked to a LoadService account yet.'}
          </p>
          <p className='mt-3 rounded-md bg-muted p-3 text-xs text-muted-foreground'>
            {error}
          </p>
          <Button
            className='mt-6'
            onClick={() =>
              navigate({
                to: errorCode.startsWith('link-') ? '/settings' : '/sign-in',
              })
            }
          >
            {errorCode.startsWith('link-') ? 'Back to settings' : 'Back to sign in'}
          </Button>
        </section>
      </main>
    )
  }

  return <p className='p-8'>Connecting Google account...</p>
}

export const Route = createFileRoute('/auth/google-callback')({
  component: GoogleCallback,
})
