"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const pg_core_2 = require("drizzle-orm/pg-core");
exports.usersTable = (0, pg_core_2.pgTable)('users', {
    id: (0, pg_core_2.uuid)().defaultRandom().primaryKey(),
    firstName: (0, pg_core_2.text)().notNull(),
    lastName: (0, pg_core_2.text)().notNull(),
    username: (0, pg_core_2.text)().notNull().unique(),
    phoneNumber: (0, pg_core_2.text)().unique(),
    email: (0, pg_core_2.text)().notNull().unique(),
    emailVerified: (0, pg_core_1.boolean)().notNull().default(false),
    createdAt: (0, pg_core_2.timestamp)('createdAt').defaultNow().notNull(),
    updatedAt: (0, pg_core_2.timestamp)('updatedAt').defaultNow().notNull(),
});
//# sourceMappingURL=user.schema.js.map