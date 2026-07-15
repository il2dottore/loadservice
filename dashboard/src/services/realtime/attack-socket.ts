import { io, type Socket } from 'socket.io-client'
import { appConfig } from '@/constants/config'

export function createAttackSocket(): Socket {
  return io(`${appConfig.socketUrl}/events`, {
    transports: ['websocket'],
    autoConnect: false,
  })
}
