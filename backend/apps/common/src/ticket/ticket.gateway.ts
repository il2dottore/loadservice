import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/tickets',
  cors: { origin: true, credentials: true },
})
export class TicketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server!: Server;

  handleConnection(client: Socket) {
    console.log('[ticket-socket] connected', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('[ticket-socket] disconnected', client.id);
  }

  emitUpdated(ticketId: number, event: 'created' | 'changed' | 'replied') {
    console.log('[ticket-socket] emit ticket.updated', { ticketId, event });
    this.server.emit('ticket.updated', { ticketId, event });
  }
}
