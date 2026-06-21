import { BaseRepository } from "../../databases/repository/base.repository";
import { usersTable } from './schemas/user.schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
export declare class UserRepository extends BaseRepository<typeof usersTable> {
    constructor(postgres: PostgresJsDatabase);
    getUserByFullnameLike(searchNameString: string, limit: number): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        username: string;
        phoneNumber: string | null;
        email: string;
        emailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
