import { createFileRoute, Link, useSearch } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/verify-email')({
  validateSearch: z.object({
    verified: z.union([z.string(), z.boolean()]).optional(),
  }),
  component: VerifyEmail,
})

function VerifyEmail() {
  const { verified } = useSearch({ from: '/verify-email' })
  const success = verified === true || verified === 'true'

  return (
    <main className='flex min-h-screen items-center justify-center bg-muted/30 p-6'>
      <section className='w-full max-w-md rounded-xl border bg-background p-8 text-center shadow-sm'>
        <h1 className='text-xl font-semibold'>
          {success ? 'Email verified' : 'Email verification'}
        </h1>
        <p className='mt-2 text-sm text-muted-foreground'>
          {success
            ? 'Your email is verified. You can now access the Hub.'
            : 'This verification link is invalid or expired.'}
        </p>
        <Link className='mt-6 inline-block underline' to='/sign-in'>
          Go to sign in
        </Link>
      </section>
    </main>
  )
}
