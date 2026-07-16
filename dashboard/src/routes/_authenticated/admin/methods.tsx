import { createFileRoute } from '@tanstack/react-router'
import { AdminMethods } from '@/features/admin/methods'

export const Route = createFileRoute('/_authenticated/admin/methods')({
  component: AdminMethods,
})
