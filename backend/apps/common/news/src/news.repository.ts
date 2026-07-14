import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '../../../../libs/database/src/postgresql/postgresql.module';
import { BasePostgresRepository } from '../../../../libs/database/src/postgresql/repository/base.repository';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { newsEntity } from './schemas/news.entity';

@Injectable()
export class NewsRepository extends BasePostgresRepository<typeof newsEntity> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, newsEntity);
  }
}
