import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { PaymentService } from './payment.service';

@Controller()
export class PaymentEventsController {
  private readonly logger = new Logger(PaymentEventsController.name);
  constructor(private readonly payments: PaymentService) {}
  @EventPattern('payment.created') acknowledge(@Ctx() ctx: RmqContext) {
    ctx.getChannelRef().ack(ctx.getMessage());
  }
  @EventPattern('payment.paid')
  async paid(
    @Payload() p: { userId: string; planId: number },
    @Ctx() ctx: RmqContext,
  ) {
    this.logger.log(
      `[PAYMENT] Consuming payment.paid user=${p.userId} plan=${p.planId}`,
    );
    await this.payments.activatePlan(p.userId, Number(p.planId));
    ctx.getChannelRef().ack(ctx.getMessage());
  }
}
