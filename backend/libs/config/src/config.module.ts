import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import postgresConfig from './namespaces/postgres.config';
import jwtConfig from './namespaces/jwt.config';
import redisConfig from './namespaces/redis.config';
import rabbitmqConfig from './namespaces/rabbitmq.config';
import googleConfig from './namespaces/google.config';
import emailConfig from './namespaces/email.config';
import paymentConfig from './namespaces/payment.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [
        postgresConfig,
        jwtConfig,
        redisConfig,
        rabbitmqConfig,
        googleConfig,
        emailConfig,
        paymentConfig,
      ],
      validationOptions: { abortEarly: false },
    }),
  ],
})
export class ConfigModule {}
