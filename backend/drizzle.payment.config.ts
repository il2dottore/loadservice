import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

export default defineConfig({
  dialect: 'postgresql',
  schema: ['./apps/payment/**/*.entity.ts'],
  out: './migrations/payment',
  dbCredentials: {
    host: process.env.POSTGRES_HOST?.replace(/,$/, '') ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASS,
    database: process.env.PAYMENT_SERVICE_DB ?? 'payment_service_db',
  },
});
