import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { PgTable } from 'drizzle-orm/pg-core';
import { IRepository } from './interface.repository';
type InferSelect<TTable extends PgTable> = TTable['$inferSelect'];
type InferInsert<TTable extends PgTable> = TTable['$inferInsert'];
export declare class BaseRepository<TTable extends PgTable> implements IRepository<TTable> {
    protected readonly postgres: PostgresJsDatabase;
    protected readonly table: TTable;
    constructor(postgres: PostgresJsDatabase, table: TTable);
    private buildWhereClause;
    findOne(where: Partial<InferSelect<TTable>>): Promise<InferSelect<TTable> | null>;
    find(where?: Partial<InferSelect<TTable>>): Promise<InferSelect<TTable>[]>;
    insertOne(data: InferInsert<TTable>): Promise<InferSelect<TTable>>;
    insert(data: InferInsert<TTable>[]): Promise<InferSelect<TTable>[]>;
    updateOne(where: Partial<InferSelect<TTable>>, data: Partial<InferInsert<TTable>>): Promise<InferSelect<TTable> | null>;
    update(where: Partial<InferSelect<TTable>>, data: Partial<InferInsert<TTable>>): Promise<InferSelect<TTable>[]>;
    deleteOne(where: Partial<InferSelect<TTable>>): Promise<InferSelect<TTable> | null>;
    delete(where: Partial<InferSelect<TTable>>): Promise<InferSelect<TTable>[]>;
}
export {};
