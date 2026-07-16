import { debugDb } from './debugDatabase';

const debugCoreDb = debugDb(process.env.CORE_SERVICE_DB ?? 'core_service_db');

const debugAttackDb = debugDb(process.env.ATTACK_SERVICE_DB ?? 'attack_service_db');

const debugPaymentDb = debugDb(process.env.ATTACK_SERVICE_DB ?? 'payment_service_db');

async function main() {

  await debugCoreDb.execute(`DROP SCHEMA public CASCADE;`);
  await debugCoreDb.execute(`CREATE SCHEMA public;`);
  await debugCoreDb.$client.end();

  await debugAttackDb.execute(`DROP SCHEMA public CASCADE;`);
  await debugAttackDb.execute(`CREATE SCHEMA public;`);
  await debugAttackDb.$client.end();

  await debugPaymentDb.execute(`DROP SCHEMA public CASCADE;`);
  await debugPaymentDb.execute(`CREATE SCHEMA public;`);
  await debugPaymentDb.$client.end();
}

main();
