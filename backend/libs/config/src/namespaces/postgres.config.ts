import { registerAs } from '@nestjs/config';

export default registerAs('postgres', () => ({
  host: process.env.POSTGRES_HOST ?? '192.168.1.240',
  port: parseInt(process.env.POSTGRES_HOST!) ?? 5432,
  user: process.env.POSTGRES_USER ?? 'sussybaka',
  pass: process.env.POSTGRES_PASS ?? 'sussybakadeptrai',
  db: process.env.POSTGRES_DB ?? undefined,
}));