import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { SQL, eq, and } from 'drizzle-orm';
import { PgTable, AnyPgColumn } from 'drizzle-orm/pg-core';
import { IPostgresRepository } from './interface.repository';

type InferSelect<TTable extends PgTable> = TTable['$inferSelect'];
type InferInsert<TTable extends PgTable> = TTable['$inferInsert'];

export class BasePostgresRepository<
  TTable extends PgTable,
> implements IPostgresRepository<TTable> {
  constructor(
    protected readonly postgres: PostgresJsDatabase,
    protected readonly table: TTable,
  ) { }

  private buildWhereClause(
    where?: Partial<InferSelect<TTable>>,
  ): SQL | undefined {
    if (!where) return undefined;
    const conditions = Object.entries(where)
      .filter(([, val]) => val !== undefined)
      .map(([key, val]) => {
        const column = this.table[
          key as keyof typeof this.table
        ] as AnyPgColumn;
        return eq(column, val);
      });
    return conditions.length > 0 ? and(...conditions) : undefined;
  }

  async findOne(
    where: Partial<InferSelect<TTable>>,
  ): Promise<InferSelect<TTable> | null> {
    const clause = this.buildWhereClause(where);
    const source: PgTable = this.table;
    const query = this.postgres.select().from(source);

    if (clause) {
      query.where(clause);
    }

    const result = await query.limit(1);
    return result[0] ?? null;
  }

  async find(
    where?: Partial<InferSelect<TTable>>,
  ): Promise<InferSelect<TTable>[]> {
    const clause = this.buildWhereClause(where);
    const source: PgTable = this.table;
    const query = this.postgres.select().from(source);
    if (clause) {
      query.where(clause);
    }
    const result = await query;
    return result;
  }

  async insertOne(data: InferInsert<TTable>): Promise<InferSelect<TTable>> {
    const result = await this.postgres
      .insert(this.table)
      .values(data)
      .returning();
    return result[0];
  }

  async insert(data: InferInsert<TTable>[]): Promise<InferSelect<TTable>[]> {
    const result = await this.postgres
      .insert(this.table)
      .values(data)
      .returning();
    return result;
  }

  async updateOne(
    where: Partial<InferSelect<TTable>>,
    data: Partial<InferInsert<TTable>>,
  ): Promise<InferSelect<TTable> | null> {
    const clause = this.buildWhereClause(where);
    const query = this.postgres.update(this.table).set(data);
    if (clause) {
      query.where(clause);
    }
    const result = await query.returning();
    return result[0] ?? null;
  }

  async update(
    where: Partial<InferSelect<TTable>>,
    data: Partial<InferInsert<TTable>>,
  ): Promise<InferSelect<TTable>[]> {
    const clause = this.buildWhereClause(where);
    const query = this.postgres.update(this.table).set(data);
    if (clause) {
      query.where(clause);
    }
    const result = await query.returning();
    return result;
  }

  async deleteOne(
    where: Partial<InferSelect<TTable>>,
  ): Promise<InferSelect<TTable> | null> {
    const clause = this.buildWhereClause(where);
    const query = this.postgres.delete(this.table);
    if (clause) {
      query.where(clause);
    }
    const result = await query.returning();
    return result[0] ?? null;
  }

  async delete(
    where: Partial<InferSelect<TTable>>,
  ): Promise<InferSelect<TTable>[]> {
    const clause = this.buildWhereClause(where);
    const query = this.postgres.delete(this.table);
    if (clause) {
      query.where(clause);
    }
    const result = await query.returning();
    return result;
  }
}
