import postgres from 'postgres';
export declare const POSTGRES: unique symbol;
export declare const postgresDatabaseProvider: {
    provide: symbol;
    useFactory: () => import("drizzle-orm/postgres-js").PostgresJsDatabase<Record<string, never>> & {
        $client: postgres.Sql<{}>;
    };
};
