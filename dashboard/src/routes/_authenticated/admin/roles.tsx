import { createFileRoute } from '@tanstack/react-router'
import { AdminRoles } from '@/features/admin/roles'

export const Route = createFileRoute('/_authenticated/admin/roles')({
  component: AdminRoles,
})
