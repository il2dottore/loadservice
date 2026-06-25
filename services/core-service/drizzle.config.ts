import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

console.log('URL:', process.env.POSTGRESQL_DATABASE_URL);

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/modules/**/schemas/*.schema.ts',
  out: './migrations',
  dbCredentials: {
    url: process.env.POSTGRESQL_DATABASE_URL!,
  },
});
