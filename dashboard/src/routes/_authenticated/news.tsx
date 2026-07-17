import { createFileRoute } from '@tanstack/react-router'
import { NewsView } from '@/features/news/news-view'

export const Route = createFileRoute('/_authenticated/news')({
  component: NewsView,
})
