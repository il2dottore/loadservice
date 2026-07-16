import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { POSTGRES } from '@app/database/postgresql/postgresql.module';
import { RABBITMQ_PAYMENT_QUEUE } from '@app/rabbitmq';
import { ClientProxy } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
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
    private readonly jwt: JwtService,
  ) {}

  async createPayment(userId: string, planId: number, amount: number) {
    if (!Number.isInteger(amount) || amount <= 0)
      throw new BadRequestException('Invalid amount');
    const transactionCode = `DS${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const [payment] = await this.postgres
      .insert(paymentEntity)
      .values({ userId, planId, amount, transactionCode })
      .returning();
    this.logger.log(
      `[PAYMENT] Created payment ${payment.id} user=${userId} plan=${planId} amount=${amount} transaction=${transactionCode}`,
    );
    const qr = new URL(this.config.getOrThrow<string>('QR_CODE_GEN_API'));
    qr.searchParams.set('amount', String(amount));
    qr.searchParams.set('des', transactionCode);
    this.paymentEvents.emit('payment.created', {
      paymentId: payment.id,
      userId,
      planId,
      amount,
      transactionCode,
    });
    return { ...payment, qrCodeUrl: qr.toString() };
  }

  async getPayment(userId: string, id: string) {
    const [payment] = await this.postgres
      .select()
      .from(paymentEntity)
      .where(and(eq(paymentEntity.id, id), eq(paymentEntity.userId, userId)))
      .limit(1);
    if (!payment) throw new BadRequestException('Payment not found');
    this.logger.debug(
      `[PAYMENT] Retrieved payment ${id} user=${userId} status=${payment.status}`,
    );
    return {
      ...payment,
      qrCodeUrl: this.getQrCodeUrl(payment.amount, payment.transactionCode),
    };
  }

  private getQrCodeUrl(amount: number, transactionCode: string) {
    const qr = new URL(this.config.getOrThrow<string>('QR_CODE_GEN_API'));
    qr.searchParams.set('amount', String(amount));
    qr.searchParams.set('des', transactionCode);
    return qr.toString();
  }

  async listPayments(userId: string) {
    return this.postgres
      .select()
      .from(paymentEntity)
      .where(eq(paymentEntity.userId, userId));
  }

  async cancelPayment(userId: string, id: string) {
    const [payment] = await this.postgres
      .update(paymentEntity)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(
        and(
          eq(paymentEntity.id, id),
          eq(paymentEntity.userId, userId),
          eq(paymentEntity.status, 'pending'),
        ),
      )
      .returning();
    if (!payment) throw new BadRequestException('Pending payment not found');
    this.logger.log(`[PAYMENT] Cancelled payment ${id} user=${userId}`);
    return payment;
  }

  async activatePlan(userId: string, planId: number) {
    this.logger.log(`[PAYMENT] Activating plan=${planId} user=${userId}`);
    const response = await fetch(
      `${this.config.get<string>('COMMON_SERVICE_URL') ?? 'http://localhost:3000'}/api/v1/users/${userId}/plans`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${await this.jwt.signAsync({ sub: userId })}`,
        },
        body: JSON.stringify({ userId, planId }),
      },
    );
    if (!response.ok) {
      this.logger.error(
        `[PAYMENT] Plan activation failed user=${userId} plan=${planId} status=${response.status}`,
      );
      throw new Error(
        `Common service rejected plan activation (${response.status})`,
      );
    }
    this.logger.log(`[PAYMENT] Plan activated user=${userId} plan=${planId}`);
    return response.json();
  }

  async handleSepayWebhook(
    payload: SepayWebhookPayload,
    authorization?: string,
  ) {
    this.logger.log(
      `[PAYMENT] SePay webhook received type=${String(payload.transferType ?? '')} amount=${String(payload.transferAmount ?? '')}`,
    );
    const secret = this.config.get<string>('SEPAY_HMAC_SHA256_KEY');
    if (secret && authorization) {
      const received = authorization.replace(/^Bearer\s+/i, '').trim();
      const expected = createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
      const valid =
        received.length === expected.length &&
        timingSafeEqual(Buffer.from(received), Buffer.from(expected));
      if (!valid) throw new UnauthorizedException('Invalid SePay signature');
    }

    if (payload.transferType !== 'in') return { success: true, ignored: true };
    const amount = Number(payload.transferAmount);
    const content = String(payload.content ?? '');
    const candidates = await this.postgres
      .select()
      .from(paymentEntity)
      .where(
        and(
          eq(paymentEntity.amount, amount),
          inArray(paymentEntity.status, ['pending']),
        ),
      );
    const payment = candidates.find((item) =>
      content.includes(item.transactionCode),
    );
    if (!payment) {
      this.logger.warn(
        `[PAYMENT] No pending payment matched webhook content=${content}`,
      );
      return { success: false, ignored: true };
    }
    const [updated] = await this.postgres
      .update(paymentEntity)
      .set({
        status: 'paid',
        sepayId: String(payload.id),
        referenceCode: String(payload.referenceCode ?? ''),
        transferContent: content,
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(paymentEntity.id, payment.id))
      .returning();
    this.paymentEvents.emit('payment.paid', updated);
    this.logger.log(
      `[PAYMENT] Marked paid payment=${payment.id} user=${payment.userId} plan=${payment.planId}`,
    );
    return { success: true };
  }
}
