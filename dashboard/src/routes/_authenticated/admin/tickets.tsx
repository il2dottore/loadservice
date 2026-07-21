import { Outlet, createFileRoute, useLocation } from '@tanstack/react-router'
import { TicketsView } from '@/features/tickets/tickets-view'

function AdminTicketsComponent() {
  const location = useLocation()
  return location.pathname === '/admin/tickets' ? (
    <TicketsView adminView />
  ) : (
    <Outlet />
  )
}

export const Route = createFileRoute('/_authenticated/admin/tickets')({
  component: AdminTicketsComponent,
})
