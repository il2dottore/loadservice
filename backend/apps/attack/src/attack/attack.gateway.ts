import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import type { Server } from 'socket.io';

@WebSocketGateway({ namespace: '/events', cors: { origin: true, credentials: true } })
export class AttackGateway {
  @WebSocketServer() private server!: Server;
  emitStatus(attack: unknown) { this.server.emit('attack.status', attack); }
}
