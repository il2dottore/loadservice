import { createFileRoute } from '@tanstack/react-router'
import { Payments } from '@/features/payments/payments-view'

export const Route = createFileRoute('/_authenticated/payments')({
  component: Payments,
})
