import { Body, Controller, Headers, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import type { SepayWebhookPayload } from './payment.service';
import { JwtAuthGuard } from '@app/auth';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() request: { user: { sub: string } }, @Body() body: { planId: number; amount: number }) {
    return this.paymentService.createPayment(request.user.sub, body.planId, body.amount);
  }

  @Post('sepay-webhook')
  @HttpCode(200)
  @ApiExcludeEndpoint()
  sepayWebhook(
    @Body() payload: SepayWebhookPayload,
    @Headers('authorization') authorization?: string,
  ) {
    return this.paymentService.handleSepayWebhook(payload, authorization);
  }
}
