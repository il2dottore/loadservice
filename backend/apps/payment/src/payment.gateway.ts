import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/payments',
  cors: {
    origin: (
      process.env.CORS_ORIGIN ??
      'http://localhost:5173,http://127.0.0.1:5173'
    )
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    credentials: true,
  },
})
export class PaymentGateway {
  private readonly logger = new Logger(PaymentGateway.name);
  @WebSocketServer() private server!: Server;

  @SubscribeMessage('payment.join')
  join(@ConnectedSocket() client: Socket, @MessageBody() paymentId: string) {
    client.join(`payment:${paymentId}`);
    this.logger.log(
      `[PAYMENT] Socket ${client.id} joined payment=${paymentId}`,
    );
  }

  emitStatus(paymentId: string, status: string) {
    const event = { paymentId, status };
    this.logger.log(
      `[PAYMENT] Emitting payment.status payment=${paymentId} status=${status}`,
    );
    this.server.to(`payment:${paymentId}`).emit('payment.status', event);
    this.server.emit('payment.status', event);
  }
}
