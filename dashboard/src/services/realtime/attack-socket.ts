import type { Socket } from 'socket.io-client'
import { appConfig } from '@/constants/config'
import { connectSocket } from './socket-endpoint'

export function createAttackSocket(): Socket {
  return connectSocket(appConfig.attackSocketUrl, {
    transports: ['polling'],
    upgrade: true,
    autoConnect: false,
    withCredentials: true,
  })
}
