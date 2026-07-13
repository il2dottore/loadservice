import { DynamicModule, Module } from '@nestjs/common';

import {
  POSTGRES_SERVICE_PREFIX,
  postgresDatabaseProvider,
} from './postgresql.provider';
import { ConfigModule } from '@nestjs/config';

@Module({})
export class PostgresDatabaseModule {
  static forService(databaseName?: string): DynamicModule {
    return {
      module: PostgresDatabaseModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: POSTGRES_SERVICE_PREFIX,
          useValue: { serviceEnvPrefix: databaseName },
        },
        postgresDatabaseProvider,
      ],
      exports: [postgresDatabaseProvider],
    };
  }
}