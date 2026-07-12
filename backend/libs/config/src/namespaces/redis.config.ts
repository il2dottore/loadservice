import { registerAs } from '@nestjs/config';

function getRedisPort(): number {
  const rawPort = process.env.REDIS_PORT?.trim();

  if (!rawPort) {
    return 6379;
  }

  const parsedPort = Number.parseInt(rawPort, 10);
  return Number.isNaN(parsedPort) ? 6379 : parsedPort;
}

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST?.trim() || 'localhost',
  port: getRedisPort(),
  password: process.env.REDIS_PASSWORD || undefined,
}));
