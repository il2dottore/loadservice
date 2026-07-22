import { api } from '@/lib/axios'

export interface NewsItem {
  id: number
  title: string
  content: string
  authorId: string | null
  createdAt: string
  updatedAt: string
}

interface NewsInput {
  title: string
  content: string
}

interface NewsPage {
  data: NewsItem[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export async function fetchNews(page = 1) {
  const { data } = await api.get<NewsPage>('/news', {
    params: { page, perPage: 10 },
  })
  return data
}

export async function createNews(input: NewsInput) {
  const { data } = await api.post<NewsItem>('/news', input)
  return data
}

export async function updateNews(id: number, input: Partial<NewsInput>) {
  const { data } = await api.put<NewsItem>(`/news/${id}`, input)
  return data
}

export async function deleteNews(id: number) {
  await api.delete(`/news/${id}`)
}
