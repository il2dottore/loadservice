import { io, type Socket } from 'socket.io-client'
import { appConfig } from '@/constants/config'

export function createAttackSocket(): Socket {
  return io(`${appConfig.attackSocketUrl}/events`, {
    transports: ['polling'],
    upgrade: true,
    autoConnect: false,
    withCredentials: true,
  })
}
