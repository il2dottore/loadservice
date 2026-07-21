import { relations } from 'drizzle-orm';
import { serverEntity } from './server.entity';
import { integer, pgTable, primaryKey, timestamp } from 'drizzle-orm/pg-core';
import { networkEntity } from './network.entity';

export const networkServerEntity = pgTable(
  'networks_servers',
  {
    networkId: integer('network_id')
      .notNull()
      .references(() => networkEntity.id, { onDelete: 'cascade' }),
    serverId: integer('server_id')
      .notNull()
      .references(() => serverEntity.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => {
    return [
      primaryKey({
        columns: [table.networkId, table.serverId],
      }),
    ];
  },
);

export const networksRelations = relations(networkEntity, ({ many }) => ({
  networkServers: many(networkServerEntity),
}));

export const networksServersRelations = relations(
  networkServerEntity,
  ({ one }) => ({
    network: one(networkEntity, {
      fields: [networkServerEntity.networkId],
      references: [networkEntity.id],
    }),
    server: one(serverEntity, {
      fields: [networkServerEntity.serverId],
      references: [serverEntity.id],
    }),
  }),
);
