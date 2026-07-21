import { Outlet, createFileRoute, useLocation } from '@tanstack/react-router'
import { TicketsView } from '@/features/tickets/tickets-view'

function TicketsComponent() {
  const location = useLocation()
  return location.pathname === '/tickets' ? <TicketsView /> : <Outlet />
}

export const Route = createFileRoute('/_authenticated/tickets')({
  component: TicketsComponent,
})
