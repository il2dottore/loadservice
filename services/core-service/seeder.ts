import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { faker } from '@faker-js/faker';
import { usersTable } from './src/modules/user/schemas/user.schema';

console.log('URL:', process.env.POSTGRESQL_DATABASE_URL);

const client = postgres(process.env.POSTGRESQL_DATABASE_URL!, {
  prepare: false,
});

const db = drizzle(client);

async function userTableSeeder() {
  await db.execute(`TRUNCATE TABLE users RESTART IDENTITY CASCADE;`);
  console.log('[START] Seeding users table...');
  for (let count = 0; count < 50; count++) {
    await db.insert(usersTable).values({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      username: faker.internet.username(),
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
