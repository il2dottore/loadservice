import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import postgresConfig from "./namespaces/postgres.config";
import jwtConfig from "./namespaces/jwt.config";
import redisConfig from "./namespaces/redis.config";
import rabbitmqConfig from "./namespaces/rabbitmq.config";

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [
        postgresConfig,
        jwtConfig,
        redisConfig,
        rabbitmqConfig
      ],
      validationOptions: { abortEarly: false },
    }),
  ],
})
export class ConfigModule { }
