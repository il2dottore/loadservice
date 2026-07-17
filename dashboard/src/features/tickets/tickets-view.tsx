import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  claimTicket,
  createTicket,
  fetchTickets,
  releaseTicket,
  updateTicketStatus,
  type TicketStatus,
} from '@/services/ticket/ticket.service'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useProfile } from '@/features/auth/hooks/auth-hooks'

function statusClass(status: TicketStatus) {
  return {
    OPEN: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-amber-100 text-amber-700',
    SOLVED: 'bg-green-100 text-green-700',
    CLOSED: 'bg-slate-200 text-slate-700',
  }[status]
}

export function TicketsView({ adminView = false }: { adminView?: boolean }) {
  const auth = useAuthStore((s) => s.auth)
  const { data: profile } = useProfile(auth.accessToken)
  const user = profile ?? auth.user
  const permissions = user?.permissions ?? []
  const support =
    permissions.includes('ticket:reply') ||
    permissions.includes('ticket:manage')
  const manage = permissions.includes('ticket:manage')
  const [filter, setFilter] = useState<
    'ALL' | 'CLAIMED' | 'MINE' | TicketStatus
  >('ALL')
  const navigate = useNavigate()
  const qc = useQueryClient()
  const tickets = useQuery({
    queryKey: ['tickets', adminView],
    queryFn: () => fetchTickets(adminView),
  })
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const create = useMutation({
    mutationFn: () => createTicket({ title, content }),
    onSuccess: () => {
      setTitle('')
      setContent('')
      qc.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
  const action = useMutation({
    mutationFn: ({ id, status }: { id: number; status?: TicketStatus }) =>
      status ? updateTicketStatus(id, status) : claimTicket(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  })
  const release = useMutation({
    mutationFn: releaseTicket,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  })
  const visibleTickets = (tickets.data ?? []).filter((ticket) => {
    if (!adminView || filter === 'ALL') return true
    if (filter === 'CLAIMED') return Boolean(ticket.assignedSupportId)
    if (filter === 'MINE') return ticket.assignedSupportId === user?.id
    return ticket.status === filter
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
          <h2 className='text-2xl font-bold tracking-tight'>Tickets</h2>
          <p className='text-muted-foreground'>
            {adminView
              ? 'Support queue'
              : support
                ? 'Support queue and your own support requests'
                : 'Contact support'}
          </p>
        </div>
        {!adminView && (
          <form
            className='max-w-2xl space-y-3 rounded-lg border p-5'
            onSubmit={(e) => {
              e.preventDefault()
              if (title && content) create.mutate()
            }}
          >
            <h3 className='font-semibold'>Create a ticket</h3>
            <Input
              placeholder='Title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder='Describe your issue'
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Button disabled={create.isPending}>Send ticket</Button>
          </form>
        )}
        {adminView && (
          <div className='flex items-center gap-3'>
            <label htmlFor='ticket-filter' className='text-sm font-medium'>
              Filter
            </label>
            <select
              id='ticket-filter'
              className='rounded-md border bg-background px-3 py-2 text-sm'
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value as typeof filter)
              }
            >
              <option value='ALL'>All tickets</option>
              <option value='CLAIMED'>Claimed</option>
              <option value='MINE'>Claimed by me</option>
              <option value='OPEN'>Open</option>
              <option value='IN_PROGRESS'>In progress</option>
              <option value='SOLVED'>Solved</option>
            </select>
          </div>
        )}
        <div className='space-y-3'>
          {visibleTickets.map((ticket) => (
            <article
              key={ticket.id}
              className='cursor-pointer rounded-lg border p-5'
              onClick={() =>
                navigate({
                  to: adminView
                    ? '/admin/tickets/$ticketId'
                    : '/tickets/$ticketId',
                  params: { ticketId: String(ticket.id) },
                })
              }
            >
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <h3 className='font-semibold'>{ticket.title}</h3>
                  <p className='mt-2 text-sm whitespace-pre-wrap text-muted-foreground'>
                    {ticket.content}
                  </p>
                </div>
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${statusClass(ticket.status)}`}
                >
                  {ticket.status}
                </span>
              </div>
              {adminView && support && (
                <div
                  className='mt-4 flex gap-2'
                  onClick={(e) => e.stopPropagation()}
                >
                  {!ticket.assignedSupportId && support && (
                    <Button
                      size='sm'
                      className='bg-blue-600 text-white hover:bg-blue-700'
                      onClick={() => action.mutate({ id: ticket.id })}
                    >
                      Claim
                    </Button>
                  )}
                  {ticket.assignedSupportId &&
                    ticket.assignedSupportId !== user?.id && (
                      <span className='self-center text-xs text-muted-foreground'>
                        Already claimed by another supporter
                      </span>
                    )}
                  {(manage || ticket.assignedSupportId === user?.id) &&
                    ticket.assignedSupportId && (
                      <>
                        <Button
                          size='sm'
                          variant='outline'
                          className='border-orange-300 text-orange-700 hover:bg-orange-50'
                          onClick={() => release.mutate(ticket.id)}
                        >
                          Release
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          className='border-green-300 text-green-700 hover:bg-green-50'
                          onClick={() =>
                            action.mutate({ id: ticket.id, status: 'SOLVED' })
                          }
                        >
                          Solved
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          className='border-slate-300 text-slate-700 hover:bg-slate-50'
                          onClick={() =>
                            action.mutate({ id: ticket.id, status: 'CLOSED' })
                          }
                        >
                          Closed
                        </Button>
                      </>
                    )}
                </div>
              )}
            </article>
          ))}
        </div>
      </Main>
    </>
  )
}
