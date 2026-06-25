import { PgTable } from 'drizzle-orm/pg-core';

export interface IRepository<TTable extends PgTable> {
  findOne(
    where: Partial<TTable['$inferSelect']>,
  ): Promise<TTable['$inferSelect'] | null>;
  find(
    where?: Partial<TTable['$inferSelect']>,
  ): Promise<TTable['$inferSelect'][]>;
  insertOne(data: TTable['$inferInsert']): Promise<TTable['$inferSelect']>;
  insert(data: TTable['$inferInsert'][]): Promise<TTable['$inferSelect'][]>;
  updateOne(
    where: Partial<TTable['$inferSelect']>,
    data: Partial<TTable['$inferInsert']>,
  ): Promise<TTable['$inferSelect'] | null>;
  update(
    where: Partial<TTable['$inferSelect']>,
    data: Partial<TTable['$inferInsert']>,
  ): Promise<TTable['$inferSelect'][]>;
  deleteOne(
    where: Partial<TTable['$inferSelect']>,
  ): Promise<TTable['$inferSelect'] | null>;
  delete(
    where: Partial<TTable['$inferSelect']>,
  ): Promise<TTable['$inferSelect'][]>;
}
