import { faker } from '@faker-js/faker';
import { debugClient, debugDb } from './debugDatabase';
import { usersTable } from '@modules/user/schemas/user.schema';

async function userTableSeeder() {
  await debugDb.execute(`TRUNCATE TABLE users RESTART IDENTITY CASCADE;`);
  console.log('[START] Seeding users table...');
  for (let count = 0; count < 50; count++) {
    await debugDb.insert(usersTable).values({
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      username: faker.internet.username(),
      phoneNumber:
        Math.random() < 0.5
          ? faker.phone.number({ style: 'international' })
          : null,
      emailVerified: Math.random() < 0.5 ? true : false,
    });
  }
  console.log('[DONE] Seeding users table');
}

async function main() {
  await userTableSeeder();
  await debugClient.end();
}

main();
