import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/events',
  cors: {
    origin: (
      process.env.CORS_ORIGIN ?? 'http://localhost:5173,http://127.0.0.1:5173'
    )
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    credentials: true,
  },
})
export class AttackGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() private server!: Server;

  afterInit() {
    console.log('[socket] gateway initialized');
  }

  handleConnection(client: Socket) {
    console.log('[socket] connected', {
      id: client.id,
      origin: client.handshake.headers.origin,
      address: client.handshake.address,
      transport: client.conn.transport.name,
    });
  }

  handleDisconnect(client: Socket) {
    console.log('[socket] disconnected', client.id);
  }

  emitStatus(attack: unknown) {
    this.server.emit('attack.status', attack);
  }
}
