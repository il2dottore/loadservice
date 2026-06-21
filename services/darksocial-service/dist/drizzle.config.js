"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_kit_1 = require("drizzle-kit");
require("dotenv/config");
console.log('URL:', process.env.POSTGRESQL_DATABASE_URL);
exports.default = (0, drizzle_kit_1.defineConfig)({
    dialect: 'postgresql',
    schema: './src/modules/**/schemas/*.schema.ts',
    out: './migrations',
    dbCredentials: {
        url: process.env.POSTGRESQL_DATABASE_URL,
    },
});
//# sourceMappingURL=drizzle.config.js.map