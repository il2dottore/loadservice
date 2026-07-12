import { createFileRoute } from '@tanstack/react-router'
import { AdminNetworks } from '@/features/admin/networks'

export const Route = createFileRoute('/_authenticated/admin/networks')({
  component: AdminNetworks,
})
