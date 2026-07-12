import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

console.log('URL:', process.env.POSTGRESQL_DATABASE_URL);

export const debugClient = postgres(process.env.POSTGRESQL_DATABASE_URL!, {
  prepare: false,
});

export const debugDb = drizzle(debugClient);
