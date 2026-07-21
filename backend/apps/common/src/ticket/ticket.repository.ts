import { Inject, Injectable } from '@nestjs/common';
import { POSTGRES } from '@app/database/postgresql/postgresql.module';
import { BasePostgresRepository } from '@app/database/postgresql/repository/base.repository';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { ticketReplyEntity } from '../entities/ticket-reply.entity';
import { ticketEntity } from '../entities/ticket.entity';

@Injectable()
export class TicketRepository extends BasePostgresRepository<
  typeof ticketEntity
> {
  constructor(@Inject(POSTGRES) postgres: PostgresJsDatabase) {
    super(postgres, ticketEntity);
  }

  async findVisible(userId: string, canSupport: boolean, canManage: boolean) {
    if (canManage)
      return this.postgres
        .select()
        .from(ticketEntity)
        .orderBy(desc(ticketEntity.createdAt));
    if (canSupport)
      return this.postgres
        .select()
        .from(ticketEntity)
        .orderBy(desc(ticketEntity.createdAt));
    return this.postgres
      .select()
      .from(ticketEntity)
      .where(eq(ticketEntity.senderId, userId))
      .orderBy(desc(ticketEntity.createdAt));
  }

  async claim(id: number, userId: string) {
    const result = await this.postgres
      .update(ticketEntity)
      .set({
        assignedSupportId: userId,
        status: 'IN_PROGRESS',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(ticketEntity.id, id),
          isNull(ticketEntity.assignedSupportId),
          eq(ticketEntity.status, 'OPEN'),
        ),
      )
      .returning();
    return result[0] ?? null;
  }

  async release(id: number, userId: string, canManage: boolean) {
    const owner = canManage
      ? eq(ticketEntity.id, id)
      : and(
          eq(ticketEntity.id, id),
          eq(ticketEntity.assignedSupportId, userId),
        );
    const result = await this.postgres
      .update(ticketEntity)
      .set({ assignedSupportId: null, status: 'OPEN', updatedAt: new Date() })
      .where(owner)
      .returning();
    return result[0] ?? null;
  }

  async addReply(ticketId: number, authorId: string, content: string) {
    const result = await this.postgres
      .insert(ticketReplyEntity)
      .values({ ticketId, authorId, content })
      .returning();
    return result[0];
  }

  async findReplies(ticketId: number) {
    return this.postgres
      .select()
      .from(ticketReplyEntity)
      .where(eq(ticketReplyEntity.ticketId, ticketId))
      .orderBy(ticketReplyEntity.createdAt);
  }
}
