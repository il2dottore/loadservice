import type { Socket } from 'socket.io-client'
import { appConfig } from '@/constants/config'
import { connectSocket } from './socket-endpoint'

export function createTicketSocket(): Socket {
  return connectSocket(appConfig.commonSocketUrl, {
    transports: ['polling'],
    upgrade: true,
    autoConnect: false,
    withCredentials: true,
  })
}
