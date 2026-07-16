import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

export default defineConfig({
  dialect: 'postgresql',
  schema: [
    './apps/common/**/*.entity.ts',
    './apps/common/**/*.entities.ts',
    './apps/common/**/*.schema.ts',
  ],
  out: './migrations',
  dbCredentials: {
    host: process.env.POSTGRES_HOST?.replace(/,$/, '') ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASS,
    database: process.env.CORE_SERVICE_DB ?? 'core_service_db',
  },
});
