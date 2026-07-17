import { createFileRoute } from '@tanstack/react-router'
import { TicketConversationView } from '@/features/tickets/ticket-conversation-view'

export const Route = createFileRoute('/_authenticated/admin/tickets/$ticketId')(
  { component: () => <TicketConversationView adminView /> }
)
