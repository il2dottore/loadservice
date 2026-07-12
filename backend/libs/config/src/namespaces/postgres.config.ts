import { registerAs } from '@nestjs/config';

export default registerAs('postgres', () => ({
  postgresUrl: process.env.POSTGRESQL_DATABASE_URL ?? 'postgresql://sussybaka:sussybakadeptrai@192.168.1.25:5432/',
}));