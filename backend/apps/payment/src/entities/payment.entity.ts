import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'paid',
  'failed',
  'cancelled',
]);

/** A payment attempt for a user's plan purchase. */
export const paymentEntity = pgTable('payments', {
  id: uuid().defaultRandom().primaryKey(),
  // IDs are kept without foreign keys because payment uses its own database.
  userId: uuid('user_id').notNull(),
  planId: integer('plan_id').notNull(),
  amount: integer('amount').notNull(),
  transactionCode: varchar('transaction_code', { length: 100 }).notNull().unique(),
  status: paymentStatusEnum('status').default('pending').notNull(),

  // SePay's transaction identifier. It is nullable until the bank transfer arrives.
  sepayId: varchar('sepay_id', { length: 100 }).unique(),
  referenceCode: varchar('reference_code', { length: 100 }),
  transferCode: varchar('transfer_code', { length: 100 }),
  transferContent: text('transfer_content'),
  transferDate: timestamp('transfer_date', { withTimezone: true }),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  failureReason: text('failure_reason'),
  // Keep instants timezone-aware; the API serializes these as ISO UTC and
  // the dashboard can then render them in the user's local timezone.
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Payment = typeof paymentEntity.$inferSelect;
export type NewPayment = typeof paymentEntity.$inferInsert;
