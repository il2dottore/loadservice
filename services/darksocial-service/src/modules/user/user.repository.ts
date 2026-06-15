import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '@databases/postgresql/postgresql.provider';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { BaseRepository } from '@databases/repository/base.repository';
import { User, usersTable } from './schemas/user.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UserRepository extends BaseRepository<User, typeof usersTable> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, usersTable);
  }

  findByEmail(email: string) {
    return this.findOne(eq(usersTable.email, email));
  }
}
