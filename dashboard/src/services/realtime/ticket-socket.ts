import { io, type Socket } from 'socket.io-client'
import { appConfig } from '@/constants/config'

export function createTicketSocket(): Socket {
  return io(`${appConfig.commonSocketUrl}/tickets`, {
    transports: ['polling'],
    upgrade: true,
    autoConnect: false,
    withCredentials: true,
  })
}
