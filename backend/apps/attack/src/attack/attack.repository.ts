import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { attackEntity } from '../entities/attack.entity';
import { POSTGRES } from '@app/database/postgresql/postgresql.module';
import { BasePostgresRepository } from '@app/database/postgresql/repository/base.repository';

@Injectable()
export class AttackRepository extends BasePostgresRepository<typeof attackEntity> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, attackEntity);
  }
}
