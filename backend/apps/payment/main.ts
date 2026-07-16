import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
      queue: process.env.RABBITMQ_PAYMENT_QUEUE ?? 'payment.events',
      queueOptions: { durable: true },
      noAck: false,
    },
  });
  app.setGlobalPrefix('api/v1', {
    // SePay is configured with this exact public callback URL.
    exclude: [{ path: 'payments/sepay-webhook', method: RequestMethod.POST }],
  });
  app.enableCors({
    origin: [
      'https://reactjs.vnb13925.online',
      'http://localhost:5173',
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const config = new DocumentBuilder()
    .setTitle('DarkService API')
    .setDescription('DarkService API documentation')
    .addBearerAuth()
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  await app.startAllMicroservices();
  await app.listen(
    process.env.PAYMENT_PORT ?? 5000,
    process.env.PAYMENT_HOST ?? '0.0.0.0',
  );
}
bootstrap();
