import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '@app/database/postgresql/postgresql.module';
import { BasePostgresRepository } from '@app/database/postgresql/repository/base.repository';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { newsEntity } from './schemas/news.entity';

@Injectable()
export class NewsRepository extends BasePostgresRepository<typeof newsEntity> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, newsEntity);
  }
}
