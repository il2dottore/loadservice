import { createFileRoute } from '@tanstack/react-router'
import { Servers } from '@/features/servers/servers-view'

export const Route = createFileRoute('/_authenticated/servers')({
  component: Servers,
})
