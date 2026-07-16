import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { methodsFeaturesTable, methodsTable } from '../entities/method.entity';
import { and, eq } from 'drizzle-orm';
import { POSTGRES } from '@app/database/postgresql/postgresql.module';
import { BasePostgresRepository } from '@app/database/postgresql/repository/base.repository';

@Injectable()
export class MethodRepository extends BasePostgresRepository<typeof methodsTable> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, methodsTable);
  }

  async findAllWithFeatures() {
    return this.postgres
      .select()
      .from(methodsTable)
      .leftJoin(methodsFeaturesTable, eq(methodsFeaturesTable.methodId, methodsTable.id));
  }

  async assignFeature(methodId: number, featureId: string) {
    const [result] = await this.postgres.insert(methodsFeaturesTable)
      .values({ methodId, featureId }).onConflictDoNothing().returning();
    return result ?? null;
  }

  async removeFeature(methodId: number, featureId: string) {
    const [result] = await this.postgres.delete(methodsFeaturesTable)
      .where(and(eq(methodsFeaturesTable.methodId, methodId), eq(methodsFeaturesTable.featureId, featureId)))
      .returning();
    return result ?? null;
  }
}
