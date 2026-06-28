import { featuresTable } from "@modules/admin/feature/schemas/feature.schema";
import { serversTable } from "@modules/admin/server/schemas/server.schema";
import { relations } from "drizzle-orm";
import { integer, pgTable, primaryKey, varchar, timestamp } from "drizzle-orm/pg-core";

/*
=============== DBML ===============
Table networks {
  id integer [pk]
  name varchar(255) [unique, not null]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`] 
}
=============== DBML ===============
*/

export const networksTable = pgTable('networks', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 255 }).unique().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const networksFeaturesTable = pgTable('networks_features', {
    networkId: integer('network_id').notNull().references(() => networksTable.id),
    featureId: integer('feature_id').notNull().references(() => featuresTable.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return [
        primaryKey({
            columns: [
                table.networkId,
                table.featureId
            ]
        })
    ];
});

export const networksRelations = relations(networksTable, ({ many }) => ({
    servers: many(serversTable),
    networksFeatures: many(networksFeaturesTable),
}));

export const networksFeaturesRelations = relations(networksFeaturesTable, ({ one }) => ({
    network: one(networksTable, {
        fields: [networksFeaturesTable.networkId],
        references: [networksTable.id]
    }),
    feature: one(featuresTable, {
        fields: [networksFeaturesTable.featureId],
        references: [featuresTable.id]
    })
}));

export type Network = typeof networksTable.$inferSelect;
