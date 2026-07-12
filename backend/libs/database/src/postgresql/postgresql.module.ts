import { DynamicModule, Module } from '@nestjs/common';

import {
  POSTGRES_SERVICE_PREFIX,
  postgresDatabaseProvider,
} from './postgresql.provider';
import { ConfigModule } from '@nestjs/config';

@Module({})
export class PostgresDatabaseModule {
  static forService(serviceEnvPrefix?: string): DynamicModule {
    return {
      module: PostgresDatabaseModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: POSTGRES_SERVICE_PREFIX,
          useValue: { serviceEnvPrefix },
        },
        postgresDatabaseProvider,
      ],
      exports: [postgresDatabaseProvider],
    };
  }
}