"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const postgres_1 = __importDefault(require("postgres"));
const postgres_js_1 = require("drizzle-orm/postgres-js");
const faker_1 = require("@faker-js/faker");
const user_schema_1 = require("./src/modules/user/schemas/user.schema");
console.log('URL:', process.env.POSTGRESQL_DATABASE_URL);
const client = (0, postgres_1.default)(process.env.POSTGRESQL_DATABASE_URL, {
    prepare: false,
});
const db = (0, postgres_js_1.drizzle)(client);
async function userTableSeeder() {
    await db.execute(`TRUNCATE TABLE users RESTART IDENTITY CASCADE;`);
    console.log('[START] Seeding users table...');
    for (let count = 0; count < 50; count++) {
        await db.insert(user_schema_1.usersTable).values({
            firstName: faker_1.faker.person.firstName(),
            lastName: faker_1.faker.person.lastName(),
            email: faker_1.faker.internet.email(),
            username: faker_1.faker.internet.username(),
            emailVerified: Math.random() < 0.5 ? true : false,
        });
    }
    console.log('[DONE] Seeding users table');
}
async function main() {
    await userTableSeeder();
    await client.end();
}
main();
//# sourceMappingURL=seeder.js.map