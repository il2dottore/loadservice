import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import {
  claimTicket,
  fetchTicket,
  releaseTicket,
  replyTicket,
  updateTicketStatus,
} from '@/services/ticket/ticket.service'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useProfile } from '@/features/auth/hooks/auth-hooks'
import { useTicketSocket } from '@/hooks/use-ticket-socket'

function statusClass(status: string) {
  return (
    {
      OPEN: 'bg-blue-100 text-blue-700',
      IN_PROGRESS: 'bg-amber-100 text-amber-700',
      SOLVED: 'bg-green-100 text-green-700',
      CLOSED: 'bg-slate-200 text-slate-700',
    }[status] ?? 'bg-muted text-muted-foreground'
  )
}

export function TicketConversationView({
  adminView = false,
}: {
  adminView?: boolean
}) {
  useTicketSocket()
  const { ticketId } = useParams({ strict: false })
  const navigate = useNavigate()
  const qc = useQueryClient()
  const auth = useAuthStore((s) => s.auth)
  const { data: profile } = useProfile(auth.accessToken)
  const user = profile ?? auth.user
  const permissions = user?.permissions ?? []
  const canReply = permissions.includes('ticket:reply')
  const canManage = permissions.includes('ticket:manage')
  const [reply, setReply] = useState('')
  const id = Number(ticketId)
  const ticket = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => fetchTicket(id),
  })
  const canReplyToTicket = (current: NonNullable<typeof ticket.data>) =>
    !adminView ||
    canManage ||
    current.senderId === user?.id ||
    (canReply && current.assignedSupportId === user?.id)
  const sendReply = useMutation({
    mutationFn: () => replyTicket(id, reply),
    onSuccess: () => {
      setReply('')
      qc.invalidateQueries({ queryKey: ['ticket', id] })
    },
  })
  const action = useMutation({
    mutationFn: (type: 'claim' | 'release' | 'solve' | 'close') =>
      type === 'claim'
        ? claimTicket(id)
        : type === 'release'
          ? releaseTicket(id)
          : updateTicketStatus(id, type === 'solve' ? 'SOLVED' : 'CLOSED'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket', id] })
      qc.invalidateQueries({ queryKey: ['tickets'] })
    },
  })

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-6'>
        <Button
          variant='ghost'
          className='w-fit'
          onClick={() =>
            navigate({ to: adminView ? '/admin/tickets' : '/tickets' })
          }
        >
          ← Back to tickets
        </Button>
        {ticket.isLoading && (
          <p className='text-muted-foreground'>Loading conversation...</p>
        )}
        {ticket.isError && (
          <p className='text-destructive'>
            Could not load this ticket conversation.
          </p>
        )}
        {ticket.data && (
          <div className='mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4'>
            <div className='rounded-lg border p-5'>
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <h2 className='text-2xl font-bold tracking-tight'>
                    {ticket.data.title}
                  </h2>
                  <p className='mt-2 whitespace-pre-wrap text-muted-foreground'>
                    {ticket.data.content}
                  </p>
                </div>
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${statusClass(ticket.data.status)}`}
                >
                  {ticket.data.status}
                </span>
              </div>
              {adminView &&
                (canReply || canManage) &&
                !['SOLVED', 'CLOSED'].includes(ticket.data.status) && (
                  <div className='mt-4 flex flex-wrap gap-2'>
                  {!ticket.data.assignedSupportId && (
                    <Button
                      size='sm'
                      className='bg-blue-600 text-white hover:bg-blue-700'
                      onClick={() => action.mutate('claim')}
                    >
                      Claim
                    </Button>
                  )}
                  {ticket.data.assignedSupportId === user?.id && (
                    <Button
                      size='sm'
                      variant='outline'
                      className='border-orange-300 text-orange-700 hover:bg-orange-50'
                      onClick={() => action.mutate('release')}
                    >
                      Release
                    </Button>
                  )}
                  {(canManage || ticket.data.assignedSupportId === user?.id) &&
                    ticket.data.assignedSupportId && (
                      <>
                        <Button
                          size='sm'
                          variant='outline'
                          className='border-green-300 text-green-700 hover:bg-green-50'
                          onClick={() => action.mutate('solve')}
                        >
                          Solved
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          className='border-slate-300 text-slate-700 hover:bg-slate-50'
                          onClick={() => action.mutate('close')}
                        >
                          Closed
                        </Button>
                      </>
                    )}
                  </div>
                )}
            </div>
            <section className='flex min-h-[500px] flex-1 flex-col rounded-lg border bg-muted/20'>
              <div className='border-b px-5 py-4'>
                <h3 className='font-semibold'>Ticket conversation</h3>
                <p className='text-xs text-muted-foreground'>
                  Messages between the requester and support
                </p>
              </div>
              <div className='flex-1 space-y-4 overflow-y-auto p-5'>
                {ticket.data.replies?.length ? (
                  ticket.data.replies.map((message) => {
                    const own = message.authorId === user?.id
                    return (
                      <div
                        key={message.id}
                        className={`flex ${own ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${own ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm bg-muted'}`}
                        >
                          <p className='mb-1 text-[11px] font-medium opacity-70'>
                            {own ? 'You' : 'Support'}
                          </p>
                          <p className='text-sm whitespace-pre-wrap'>
                            {message.content}
                          </p>
                          <p className='mt-2 text-[10px] opacity-60'>
                            {new Date(message.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className='py-20 text-center text-sm text-muted-foreground'>
                    No messages yet. Start the conversation below.
                  </p>
                )}
              </div>
              {ticket.data.status !== 'SOLVED' &&
                ticket.data.status !== 'CLOSED' &&
                canReplyToTicket(ticket.data) && (
                  <form
                    className='flex gap-2 border-t bg-background p-4'
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (reply.trim()) sendReply.mutate()
                    }}
                  >
                    <Textarea
                      className='min-h-12 resize-none'
                      placeholder='Write a message...'
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                    />
                    <Button
                      className='self-end'
                      disabled={sendReply.isPending || !reply.trim()}
                    >
                      Send
                    </Button>
                  </form>
                )}
              {ticket.data.status !== 'SOLVED' &&
                ticket.data.status !== 'CLOSED' &&
                !canReplyToTicket(ticket.data) && (
                  <p className='border-t bg-background p-4 text-sm text-muted-foreground'>
                    Claim this ticket before replying.
                  </p>
                )}
              {(ticket.data.status === 'SOLVED' ||
                ticket.data.status === 'CLOSED') && (
                <p className='border-t p-4 text-sm text-muted-foreground'>
                  This ticket is closed for new replies.
                </p>
              )}
            </section>
          </div>
        )}
      </Main>
    </>
  )
}
