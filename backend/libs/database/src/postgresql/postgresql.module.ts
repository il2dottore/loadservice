import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

export const POSTGRES = Symbol('POSTGRES');

function resolveDbName(configService: ConfigService, servicePrefix: string) {
  // If found, example: `ATTACK_SERVICE_DB=attack-service-db`, return.
  const fromEnv = configService.get<string>(servicePrefix.toLowerCase() + '_SERVICE_DB');
  if (fromEnv) return fromEnv;
  // If servicePrefix is defined, example: `core`. Transform to core_service_db, return.
  return servicePrefix + '_service_db';
}

@Module({})
@Global()
export class PostgresDatabaseModule {
  static forService(servicePrefix: string): DynamicModule {
    return {
      module: PostgresDatabaseModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: POSTGRES,
          useFactory: (configService: ConfigService) => {
            const client = postgres({
              host: configService.get<string>('postgres.hostname'),
              port: configService.get<number>('postgres.port'),
              user: configService.get<string>('postgres.user'),
              pass: configService.get<string>('postgres.pass'),
              db: resolveDbName(configService, servicePrefix),
              prepare: false,
            });

            return drizzle(client);
          },
          inject: [ConfigService],
        },
      ],
      exports: [POSTGRES],
    };
  }
}
