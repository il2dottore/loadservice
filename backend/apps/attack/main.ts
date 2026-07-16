import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
      queue: process.env.RABBITMQ_ATTACK_STATUS_QUEUE ?? 'attack.status.events',
      queueOptions: { durable: true },
      noAck: false,
    },
  });
  app.setGlobalPrefix('api/v1');
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
    process.env.ATTACK_PORT ?? 4000,
    '0.0.0.0',
  );
}
bootstrap();
