import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { SQL } from 'drizzle-orm';
import { IRepository } from './interface.repository';

export class BaseRepository<T, TTable> implements IRepository<T, TTable> {
  constructor(
    protected readonly postgres: PostgresJsDatabase,
    protected readonly table: TTable,
  ) {}

  async findOne(where: SQL): Promise<T | null> {
    const result = await this.postgres
      .select()
      .from(this.table as any)
      .where(where)
      .limit(1);

    return result[0] ?? null;
  }

  async find(where?: SQL): Promise<T[]> {
    const result = this.postgres.select().from(this.table as any);
    if (where) {
      result.where(where);
    }
    return result;
  }
}
