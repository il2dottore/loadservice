import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createAttackSocket } from '@/services/realtime/attack-socket'
import type { Attack } from '@/services/attack/attack.service'

export function useAttackSocket() {
  const queryClient = useQueryClient()
  useEffect(() => {
    const socket = createAttackSocket()
    socket.on('connect', () => {
    })
    socket.on('attack.status', (attack: Attack) => {
      queryClient.invalidateQueries({ queryKey: ['hub', 'attacks'] })
      const message = `Attack #${attack.id}: ${attack.status}`
      if (['COMPLETED'].includes(attack.status)) toast.success(message)
      else if (['FAILED', 'REJECTED', 'TIMEOUT'].includes(attack.status)) toast.error(message)
      else if (['CANCELLED'].includes(attack.status)) toast.warning(message)
      else if (['RUNNING'].includes(attack.status)) toast.info(message)
      else toast.message(message)
    })
    socket.connect()
    return () => {
      socket.disconnect()
    }
  }, [queryClient])
}
