import { createFileRoute } from '@tanstack/react-router'
import { ForgotPassword } from '@/features/auth/forgot-password'
import { z } from 'zod'

export const Route = createFileRoute('/(auth)/forgot-password')({
  validateSearch: z.object({ token: z.string().optional() }),
  component: ForgotPassword,
})
