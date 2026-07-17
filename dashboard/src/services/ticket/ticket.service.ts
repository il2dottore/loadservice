import { api } from '@/lib/axios'

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'SOLVED' | 'CLOSED'
export interface TicketReply {
  id: number
  ticketId: number
  authorId: string
  content: string
  createdAt: string
}
export interface Ticket {
  id: number
  title: string
  content: string
  status: TicketStatus
  senderId: string | null
  assignedSupportId: string | null
  createdAt: string
  updatedAt: string
  replies?: TicketReply[]
}

export async function fetchTickets(admin = false) {
  return (
    await api.get<Ticket[]>('/tickets', {
      params: admin ? { scope: 'admin' } : undefined,
    })
  ).data
}
export async function createTicket(input: { title: string; content: string }) {
  return (await api.post<Ticket>('/tickets', input)).data
}
export async function fetchTicket(id: number) {
  return (await api.get<Ticket>(`/tickets/${id}`)).data
}
export async function claimTicket(id: number) {
  return (await api.post<Ticket>(`/tickets/${id}/claim`)).data
}
export async function releaseTicket(id: number) {
  return (await api.post<Ticket>(`/tickets/${id}/release`)).data
}
export async function updateTicketStatus(id: number, status: TicketStatus) {
  return (await api.patch<Ticket>(`/tickets/${id}/status`, { status })).data
}
export async function replyTicket(id: number, content: string) {
  return (await api.post<TicketReply>(`/tickets/${id}/replies`, { content }))
    .data
}
