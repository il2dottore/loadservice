import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from '@app/common/filters/http-exception.filter';
import { TransformInterceptor } from '@app/common/interceptors/transform.interceptor';
import { AuthLibModule } from '@app/auth';
import { PostgresDatabaseModule } from '@app/database/postgresql/postgresql.module';
import { PaymentController } from './src/payment.controller';
import { PaymentService } from './src/payment.service';
import { PaymentEventsController } from './src/payment-events.controller';
import { ConfigModule } from '@app/config';
import { RabbitmqModule, RABBITMQ_PAYMENT_QUEUE } from '@app/rabbitmq';

@Module({
  imports: [
    AuthLibModule,
    PostgresDatabaseModule.forService('payment'),
    ConfigModule,
    RabbitmqModule.forServices([
      { name: RABBITMQ_PAYMENT_QUEUE, configKey: 'rabbitmq.paymentQueue' },
    ]),
  ],
  controllers: [PaymentController, PaymentEventsController],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    PaymentService,
  ],
})
export class AppModule {}
