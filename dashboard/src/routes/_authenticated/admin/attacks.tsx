import { createFileRoute } from '@tanstack/react-router'
import { AdminAttacks } from '@/features/admin/attacks/admin-attacks-view'

export const Route = createFileRoute('/_authenticated/admin/attacks')({
  component: AdminAttacks,
})
