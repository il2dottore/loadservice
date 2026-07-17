import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchNews } from '@/services/news/news.service'
import { Loader2, Newspaper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { NewsRichText } from '@/components/news-rich-text'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export function NewsView() {
  const [page, setPage] = useState(1)
  const { data: news, isLoading } = useQuery({
    queryKey: ['news', page],
    queryFn: () => fetchNews(page),
  })

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>News</h2>
          <p className='text-muted-foreground'>
            Latest announcements and updates.
          </p>
        </div>
        {isLoading ? (
          <Loader2 className='mx-auto mt-12 size-6 animate-spin' />
        ) : !news || news.data.length === 0 ? (
          <div className='rounded-lg border p-10 text-center text-muted-foreground'>
            <Newspaper className='mx-auto mb-3 size-8' />
            No news yet.
          </div>
        ) : (
          <div className='space-y-4'>
            {news.data.map((item) => (
              <article className='rounded-lg border p-5' key={item.id}>
                <h3 className='text-lg font-semibold'>{item.title}</h3>
                <p className='mt-1 text-xs text-muted-foreground'>
                  {new Date(item.createdAt).toLocaleString()}
                </p>
                <div className='mt-4'>
                  <NewsRichText html={item.content} />
                </div>
              </article>
            ))}
            <div className='flex items-center justify-between'>
              <Button
                variant='outline'
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className='text-sm text-muted-foreground'>
                Page {news.page} of {news.totalPages || 1}
              </span>
              <Button
                variant='outline'
                disabled={page >= news.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Main>
    </>
  )
}
