import { configDotenv } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

configDotenv({
  path: './.env'
});

export default defineConfig({
  dialect: 'postgresql',
  schema: ['./apps/attack/**/*.entity.ts'],
  out: './migrations/attack',
  dbCredentials: {
    host: process.env.POSTGRES_HOST?.replace(/,$/, '') ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASS,
    database: process.env.ATTACK_SERVICE_DB ?? 'attack_service_db',
  },
});
