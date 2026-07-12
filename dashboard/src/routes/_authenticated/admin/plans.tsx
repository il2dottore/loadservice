import { createFileRoute } from '@tanstack/react-router'
import { AdminPlans } from '@/features/admin/plans'

export const Route = createFileRoute('/_authenticated/admin/plans')({
  component: AdminPlans,
})
