import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { api } from '@/lib/axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  confirmPassword: z.string(),
}).refine((value) => value.password === value.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match.',
})

export function ResetPasswordForm({ token }: { token: string }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  async function submit(values: z.infer<typeof schema>) {
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password: values.password })
      toast.success('Password reset successfully.')
      navigate({ to: '/sign-in' })
    } catch {
      toast.error('This reset link is invalid or expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(submit)} className='grid gap-4'>
      <Input type='password' placeholder='New password' {...form.register('password')} />
      {form.formState.errors.password && <p className='text-sm text-destructive'>{form.formState.errors.password.message}</p>}
      <Input type='password' placeholder='Confirm password' {...form.register('confirmPassword')} />
      {form.formState.errors.confirmPassword && <p className='text-sm text-destructive'>{form.formState.errors.confirmPassword.message}</p>}
      <Button disabled={loading}>{loading ? 'Resetting...' : 'Reset password'}</Button>
    </form>
  )
}
