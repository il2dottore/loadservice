import { Module } from '@nestjs/common';
import { redisDatabaseProvider } from './redis.provider';

@Module({
  providers: [redisDatabaseProvider],
  exports: [redisDatabaseProvider],
})
export class RedisDatabaseModule {}
