import { faker } from '@faker-js/faker';
import { debugClient, debugDb } from './debugDatabase';
import { usersTable } from '@modules/user/schemas/user.schema';
import { plansTable } from '@modules/admin/plan/schemas/plan.schema';

async function usersTableSeeder() {
  await debugDb.execute(`TRUNCATE TABLE users RESTART IDENTITY CASCADE;`);
  console.log('[START] Seeding users table...');
  for (let count = 0; count < 10; count++) {
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
      password: faker.internet.password(),
    });
  }
  console.log('[DONE] Seeding users table');
}

/*
=============== DBML ===============
Table plans {
  id integer [pk]
  name varchar(255) [unique, not null]
  rank integer [not null]
  price integer [not null]
  max_duration integer [not null]
  max_concurrents integer [not null]
  is_custom bool [not null]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}
=============== DBML ===============
*/
async function plansTableSeeder() {
  await debugDb.execute(`TRUNCATE TABLE plans RESTART IDENTITY CASCADE;`);
  console.log('[START] Seeding plans table...');
  
  console.log('[DONE] Seeding plans table');
}

async function main() {
  await usersTableSeeder();
  await debugClient.end();
}

main();

enum Features {
  FREE_LAYER_4 = 'FREE_LAYER_4',
  FREE_LAYER_7 = 'FREE_LAYER_7',
  ADVANCED_LAYER_4 = 'ADVANCED_LAYER_4',
  ADVANCED_LAYER_7 = 'ADVANCED_LAYER_7',
  API_ACCESS = 'API_ACCESS',
  VIP_ACCESS = 'VIP_ACCESS'
}

class Plans {
  FREE = [
    Features.FREE_LAYER_4,
    Features.FREE_LAYER_7
  ];
  ADVANCED = [
    ...this.FREE,
    Features.ADVANCED_LAYER_4,
    Features.ADVANCED_LAYER_7
  ];
  VIP = [
    ...this.ADVANCED,
    Features.VIP_ACCESS
  ];
  BUSINESS = [
    ...this.VIP,
    Features.API_ACCESS
  ];
}