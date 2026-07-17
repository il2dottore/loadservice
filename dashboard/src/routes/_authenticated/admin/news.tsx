import { createFileRoute } from '@tanstack/react-router'
import { AdminNewsView } from '@/features/admin/news/admin-news-view'

export const Route = createFileRoute('/_authenticated/admin/news')({
  component: AdminNewsView,
})
