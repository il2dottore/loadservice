import 'dotenv/config';
import postgres from 'postgres';
export declare const debugClient: postgres.Sql<{}>;
export declare const debugDb: import("drizzle-orm/postgres-js").PostgresJsDatabase<Record<string, never>> & {
    $client: postgres.Sql<{}>;
};
