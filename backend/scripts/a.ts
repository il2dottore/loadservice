import { faker } from "@faker-js/faker";
import * as argon2 from 'argon2';

async function r() {
  for (let count = 0; count < 10; count++) {
    console.log({
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      username: faker.internet.username(),
      phoneNumber:
        Math.random() < 0.5
          ? faker.phone.number({ style: 'international' })
          : null,
      emailVerified: Math.random() < 0.5 ? true : false,
      password: await argon2.hash('sussybakadeptrai'),
    });
  }
}

r();