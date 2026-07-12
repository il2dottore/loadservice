import { ConfigService } from '@nestjs/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

export const POSTGRES = Symbol('POSTGRES');
export const POSTGRES_SERVICE_PREFIX = Symbol('POSTGRES_SERVICE_PREFIX');

export interface PostgresServiceOptions {
  serviceEnvPrefix: string;
}

function buildPostgresUrl(baseUrl: string, databaseName: string): string {
  const url = new URL(baseUrl);
  url.pathname = `/${databaseName}`;
  return url.toString();
}

function resolveDatabaseName(
  configService: ConfigService,
  serviceEnvPrefix: string,
): string {
  return (
    configService.get<string>(`${serviceEnvPrefix}_DB_NAME`) ??
    `${serviceEnvPrefix.toLowerCase()}_db`
  );
}

export const postgresDatabaseProvider = {
  provide: POSTGRES,
  useFactory: (
    configService: ConfigService,
    options: PostgresServiceOptions,
  ) => {
    const baseUrl = configService.getOrThrow<string>('postgres.postgresUrl');
    const databaseName = resolveDatabaseName(
      configService,
      options.serviceEnvPrefix ?? 'darksocial',
    );
    const client = postgres(buildPostgresUrl(baseUrl, databaseName), {
      prepare: false,
    });
    return drizzle(client);
  },
  inject: [ConfigService, POSTGRES_SERVICE_PREFIX],
};
