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
    socket.on('connect_error', (error) => {
      console.error('[ticket-socket] connection error', error.message)
    })
    socket.on('disconnect', (reason) => {
      console.warn('[ticket-socket] disconnected', reason)
    })
    socket.connect()

    return () => {
      socket.off('ticket.updated', refresh)
      socket.off('connect', refresh)
      socket.off('connect_error')
      socket.off('disconnect')
      socket.disconnect()
    }
  }, [queryClient])
}
