import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import postgresConfig from "./namespaces/postgres.config";

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      load: [
        postgresConfig
      ],
      validationOptions: { abortEarly: false },
    }),
  ],
})
export class ConfigModule { }