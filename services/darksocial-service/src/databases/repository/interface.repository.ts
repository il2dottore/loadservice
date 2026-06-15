import { SQL } from 'drizzle-orm';

export interface IRepository<T, TEntity> {
  findOne(where: SQL): Promise<T | null>;
}
