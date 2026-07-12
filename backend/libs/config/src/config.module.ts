import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import postgresConfig from "./namespaces/postgres.config";
import jwtConfig from "./namespaces/jwt.config";
import redisConfig from "./namespaces/redis.config";

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      load: [
        postgresConfig,
        jwtConfig,
        redisConfig
      ],
      validationOptions: { abortEarly: false },
    }),
  ],
})
export class ConfigModule { }