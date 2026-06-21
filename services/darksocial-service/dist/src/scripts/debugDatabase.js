"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugDb = exports.debugClient = void 0;
require("dotenv/config");
const postgres_1 = __importDefault(require("postgres"));
const postgres_js_1 = require("drizzle-orm/postgres-js");
console.log('URL:', process.env.POSTGRESQL_DATABASE_URL);
exports.debugClient = (0, postgres_1.default)(process.env.POSTGRESQL_DATABASE_URL, {
    prepare: false,
});
exports.debugDb = (0, postgres_js_1.drizzle)(exports.debugClient);
//# sourceMappingURL=debugDatabase.js.map