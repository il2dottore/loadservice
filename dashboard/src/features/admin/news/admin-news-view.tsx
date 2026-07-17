import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchNews,
  createNews,
  updateNews,
  deleteNews,
  type NewsItem,
} from '@/services/news/news.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NewsRichTextEditor, NewsRichText } from '@/components/news-rich-text'

export function AdminNewsView() {
  const client = useQueryClient()
  const [page, setPage] = useState(1)
  const { data: news } = useQuery({
    queryKey: ['news', page],
    queryFn: () => fetchNews(page),
  })
  const [editing, setEditing] = useState<NewsItem | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const save = useMutation({
    mutationFn: () =>
      editing
        ? updateNews(editing.id, { title, content })
        : createNews({ title, content }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['news'] })
      setEditing(null)
      setTitle('')
      setContent('')
    },
  })
  const remove = useMutation({
    mutationFn: deleteNews,
    onSuccess: () => client.invalidateQueries({ queryKey: ['news'] }),
  })
  const edit = (item: NewsItem) => {
    setEditing(item)
    setTitle(item.title)
    setContent(item.content)
  }
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Manage News</h2>
        <p className='text-muted-foreground'>
          Create and manage announcements.
        </p>
      </div>
      <div className='space-y-3 rounded-lg border p-5'>
        <Input
          placeholder='Title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <NewsRichTextEditor value={content} onChange={setContent} />
        <div className='flex gap-2'>
          <Button
            disabled={!title.trim() || !content.trim() || save.isPending}
            onClick={() => save.mutate()}
          >
            {editing ? 'Save' : 'Create'}
          </Button>
          {editing && (
            <Button
              variant='outline'
              onClick={() => {
                setEditing(null)
                setTitle('')
                setContent('')
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
      <div className='space-y-3'>
        {news?.data.map((item) => (
          <div
            className='flex items-start justify-between rounded-lg border p-4'
            key={item.id}
          >
            <div>
              <h3 className='font-semibold'>{item.title}</h3>
              <div className='mt-1 text-muted-foreground'>
                <NewsRichText html={item.content} />
              </div>
            </div>
            <div className='flex gap-2'>
              <Button size='sm' variant='outline' onClick={() => edit(item)}>
                Edit
              </Button>
              <Button
                size='sm'
                variant='destructive'
                onClick={() => remove.mutate(item.id)}
              >
                Delete
              </Button>
            </div>
          </div>
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
            Page {news?.page ?? 1} of {news?.totalPages || 1}
          </span>
          <Button
            variant='outline'
            disabled={!news || page >= news.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
