import { Outlet, createFileRoute, useLocation } from '@tanstack/react-router'
import { TicketsView } from '@/features/tickets/tickets-view'

export const Route = createFileRoute('/_authenticated/admin/tickets')({
  component: () => {
    const location = useLocation()
    return location.pathname === '/admin/tickets' ? (
      <TicketsView adminView />
    ) : (
      <Outlet />
    )
  },
})
