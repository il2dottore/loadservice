import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createTicketSocket } from '@/services/realtime/ticket-socket'

export function useTicketSocket() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const socket = createTicketSocket()
    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      queryClient.invalidateQueries({ queryKey: ['ticket'] })
    }

    socket.on('ticket.updated', refresh)
    socket.on('connect', refresh)
    socket.connect()

    return () => {
      socket.off('ticket.updated', refresh)
      socket.off('connect', refresh)
      socket.disconnect()
    }
  }, [queryClient])
}
