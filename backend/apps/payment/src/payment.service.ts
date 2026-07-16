import { Inject, Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { POSTGRES } from '@app/database/postgresql/postgresql.module';
import { RABBITMQ_PAYMENT_QUEUE } from '@app/rabbitmq';
import { ClientProxy } from '@nestjs/microservices';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, inArray } from 'drizzle-orm';
import { paymentEntity } from './entities/payment.entity';

export type SepayWebhookPayload = Record<string, unknown>;

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly config: ConfigService,
    @Inject(POSTGRES) private readonly postgres: PostgresJsDatabase,
    @Inject(RABBITMQ_PAYMENT_QUEUE) private readonly paymentEvents: ClientProxy,
  ) {}

  async createPayment(userId: string, planId: number, amount: number) {
    if (!Number.isInteger(amount) || amount <= 0) throw new BadRequestException('Invalid amount');
    const transactionCode = `DS${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const [payment] = await this.postgres.insert(paymentEntity).values({ userId, planId, amount, transactionCode }).returning();
    const qr = new URL(this.config.getOrThrow<string>('QR_CODE_GEN_API'));
    qr.searchParams.set('amount', String(amount));
    qr.searchParams.set('des', transactionCode);
    this.paymentEvents.emit('payment.created', { paymentId: payment.id, userId, planId, amount, transactionCode });
    return { ...payment, qrCodeUrl: qr.toString() };
  }

  async handleSepayWebhook(payload: SepayWebhookPayload, authorization?: string) {
    const secret = this.config.get<string>('SEPAY_HMAC_SHA256_KEY');
    if (secret && authorization) {
      const received = authorization.replace(/^Bearer\s+/i, '').trim();
      const expected = createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
      const valid = received.length === expected.length &&
        timingSafeEqual(Buffer.from(received), Buffer.from(expected));
      if (!valid) throw new UnauthorizedException('Invalid SePay signature');
    }

    if (payload.transferType !== 'in') return { success: true, ignored: true };
    const amount = Number(payload.transferAmount);
    const content = String(payload.content ?? '');
    const candidates = await this.postgres.select().from(paymentEntity)
      .where(and(eq(paymentEntity.amount, amount), inArray(paymentEntity.status, ['pending'])));
    const payment = candidates.find((item) => content.includes(item.transactionCode));
    if (!payment) return { success: false, ignored: true };
    const [updated] = await this.postgres.update(paymentEntity).set({ status: 'paid', sepayId: String(payload.id), referenceCode: String(payload.referenceCode ?? ''), transferContent: content, paidAt: new Date(), updatedAt: new Date() }).where(eq(paymentEntity.id, payment.id)).returning();
    this.paymentEvents.emit('payment.paid', updated);
    return { success: true };
  }
}
