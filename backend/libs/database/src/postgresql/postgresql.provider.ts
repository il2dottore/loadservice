import { ConfigService } from '@nestjs/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

export const POSTGRES = Symbol('POSTGRES');
export const POSTGRES_SERVICE_PREFIX = Symbol('POSTGRES_SERVICE_PREFIX');

export interface PostgresServiceOptions {
  databaseName: string;
}

function resolveDatabaseName(configService: ConfigService, databaseName: string) {
  const fromEnv = configService.get<string>('postgres.db');
  if (!fromEnv) {
    return fromEnv;
  }
  return databaseName;
}

export const postgresDatabaseProvider = {
  provide: POSTGRES,
  useFactory: (
    configService: ConfigService,
    options: PostgresServiceOptions,
  ) => {
    const client = postgres({
      host: configService.get<string>('postgres.hostname'),
      port: +configService.getOrThrow<string>('postgres.port'),
      user: configService.get<string>('postgres.user'),
      pass: configService.get<string>('postgres.pass'),
      db: resolveDatabaseName(configService, options.databaseName),
      prepare: false
    });
    return drizzle(client);
  },
  inject: [ConfigService, POSTGRES_SERVICE_PREFIX],
};
