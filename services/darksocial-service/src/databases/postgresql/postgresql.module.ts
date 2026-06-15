import { Module } from '@nestjs/common';
import { postgresDatabaseProvider } from './postgresql.provider';

@Module({
  providers: [postgresDatabaseProvider],
  exports: [postgresDatabaseProvider],
})
export class PostgresDatabaseModule {}
