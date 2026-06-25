import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '@databases/postgresql/postgresql.provider';
import { BaseRepository } from '@databases/repository/base.repository';
import { usersTable } from './schemas/user.schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { like } from 'drizzle-orm';
import { or } from 'drizzle-orm';

@Injectable()
export class UserRepository extends BaseRepository<typeof usersTable> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, usersTable);
  }

  async getUserByFullnameLike(searchNameString: string, limit: number) {
    const users = await this.postgres
      .select()
      .from(this.table)
      .where(
        or(
          like(usersTable.firstName, `%${searchNameString}%`),
          like(usersTable.lastName, `%${searchNameString}%`),
        ),
      )
      .limit(limit);
    return users;
  }
}
