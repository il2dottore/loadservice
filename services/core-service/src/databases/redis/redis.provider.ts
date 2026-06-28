import { Redis } from 'ioredis';

export const REDIS = Symbol('REDIS');

export const redisDatabaseProvider = {
  provide: REDIS,
  useFactory: () => {
    return new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
  },
};
