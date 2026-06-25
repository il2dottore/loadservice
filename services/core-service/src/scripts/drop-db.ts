import { debugClient, debugDb } from './debugDatabase';

async function main() {
  await debugDb.execute(`DROP SCHEMA public CASCADE;`);
  await debugDb.execute(`CREATE SCHEMA public;`);
  await debugClient.end();
}

main();
