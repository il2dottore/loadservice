import { createFileRoute } from '@tanstack/react-router'
import { Hub } from '@/features/hub'

export const Route = createFileRoute('/_authenticated/hub')({
  component: Hub,
})
