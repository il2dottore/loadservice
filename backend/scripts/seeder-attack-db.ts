import { faker } from '@faker-js/faker';
import { debugDb } from './debugDatabase';
import { methodsTable, OsiLayer } from '../apps/attack/src/entities/method.entity';
import { networkEntity } from '../apps/attack/src/entities/network.entity';
import { networkServerEntity } from '../apps/attack/src/entities/network-server.entity';
import { serverEntity } from '../apps/attack/src/entities/server.entity';
import { attackEntity } from '../apps/attack/src/entities/attack.entity';

const db = debugDb(process.env.ATTACK_SERVICE_DB ?? 'attack_service_db');

async function main() {
  await db.execute('TRUNCATE TABLE attacks, networks_servers, servers, networks, methods RESTART IDENTITY CASCADE;');

  const methods = await db.insert(methodsTable).values([
    { name: 'HTTP_FREE', osiLayer: OsiLayer.LAYER_7 },
    { name: 'UDP_FREE', osiLayer: OsiLayer.LAYER_4 },
  ]).returning();
  const networks = await db.insert(networkEntity).values([
    { name: 'Free Network' },
  ]).returning();
  const servers = await db.insert(serverEntity).values([
    { name: 'Free-Server-1', address: '192.168.1.240', slots: 3 },
  ]).returning();

  await db.insert(networkServerEntity).values(
    servers.flatMap((server, index) => ({
      serverId: server.id,
      networkId: networks[0].id,
    })),
  );

  /**
   await db.insert(attackEntity).values(Array.from({ length: 15 }, (_, index) => {
    const method = methods[index % methods.length];
    return {
      target: faker.internet.domainName(),
      duration: faker.number.int({ min: 30, max: 600 }),
      methodId: method.id,
      userId: null,
      serverId: servers[index % servers.length].id,
      ...(method.osiLayer === OsiLayer.LAYER_4
        ? { port: faker.number.int({ min: 1, max: 65535 }), ppsLimit: faker.number.int({ min: 100, max: 5000 }) }
        : { rateLimit: faker.number.int({ min: 100, max: 5000 }), requestMethod: 'GET' as const }),
    };
  }));
   */

  await db.$client.end();
}

main().catch(async (error) => {
  console.error(error);
  await db.$client.end();
  process.exitCode = 1;
});
