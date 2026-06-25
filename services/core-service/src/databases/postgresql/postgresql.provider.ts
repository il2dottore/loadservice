import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

export const POSTGRES = Symbol('POSTGRES');

export const postgresDatabaseProvider = {
  provide: POSTGRES,
  useFactory: () => {
    const client = postgres(process.env.POSTGRESQL_DATABASE_URL!, {
      prepare: false,
    });

    return drizzle(client);
  },
};
