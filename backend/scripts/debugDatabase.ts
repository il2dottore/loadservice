import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

export const debugClient = function (databaseName: string) {
  return postgres({
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASS,
    database: databaseName,
    prepare: false,
  });;
}

export const debugDb = function (databaseName: string) {
  const client = debugClient(databaseName);
  return drizzle(client);
};
