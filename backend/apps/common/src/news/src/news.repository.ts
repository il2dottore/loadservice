import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '@app/database/postgresql/postgresql.module';
import { BasePostgresRepository } from '@app/database/postgresql/repository/base.repository';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { newsEntity } from './schemas/news.entity';
import { desc } from 'drizzle-orm';

@Injectable()
export class NewsRepository extends BasePostgresRepository<typeof newsEntity> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, newsEntity);
  }

  async findPage(page: number, perPage: number) {
    const safePage = Math.max(1, page);
    const safePerPage = Math.min(10, Math.max(1, perPage));
    const [data, total] = await Promise.all([
      this.postgres
        .select()
        .from(newsEntity)
        .orderBy(desc(newsEntity.createdAt))
        .limit(safePerPage)
        .offset((safePage - 1) * safePerPage),
      this.countAll(),
    ]);
    return {
      data,
      total,
      page: safePage,
      perPage: safePerPage,
      totalPages: Math.ceil(total / safePerPage),
    };
  }
}
