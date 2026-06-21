"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const debugDatabase_1 = require("./debugDatabase");
const user_schema_1 = require("../modules/user/schemas/user.schema");
async function userTableSeeder() {
    await debugDatabase_1.debugDb.execute(`TRUNCATE TABLE users RESTART IDENTITY CASCADE;`);
    console.log('[START] Seeding users table...');
    for (let count = 0; count < 50; count++) {
        await debugDatabase_1.debugDb.insert(user_schema_1.usersTable).values({
            email: faker_1.faker.internet.email(),
            firstName: faker_1.faker.person.firstName(),
            lastName: faker_1.faker.person.lastName(),
            username: faker_1.faker.internet.username(),
            phoneNumber: Math.random() < 0.5
                ? faker_1.faker.phone.number({ style: 'international' })
                : null,
            emailVerified: Math.random() < 0.5 ? true : false,
        });
    }
    console.log('[DONE] Seeding users table');
}
async function main() {
    await userTableSeeder();
    await debugDatabase_1.debugClient.end();
}
main();
//# sourceMappingURL=seeder-db.js.map