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
    { name: 'UDP_FLOOD', osiLayer: OsiLayer.LAYER_4 },
    { name: 'TCP_SYN', osiLayer: OsiLayer.LAYER_4 },
    { name: 'HTTP_BYPASS', osiLayer: OsiLayer.LAYER_7 },
    { name: 'BROWSER_STORM', osiLayer: OsiLayer.LAYER_7 },
  ]).returning();
  const networks = await db.insert(networkEntity).values([
    { name: 'Bronze Network', vipAccess: false },
    { name: 'Gold Network', vipAccess: false },
    { name: 'Diamond Network', vipAccess: true },
  ]).returning();
  const servers = await db.insert(serverEntity).values([
    { name: 'alpha-core', address: '10.10.0.10' },
    { name: 'beta-core', address: '10.10.0.11' },
    { name: 'gamma-edge', address: '10.10.1.10' },
    { name: 'delta-edge', address: '10.10.1.11' },
    { name: 'omega-premium', address: '10.10.2.10' },
  ]).returning();

  await db.insert(networkServerEntity).values(
    servers.flatMap((server, index) => ({
      serverId: server.id,
      networkId: networks[index % networks.length].id,
    })),
  );

  await db.insert(attackEntity).values(Array.from({ length: 15 }, (_, index) => ({
    target: faker.internet.domainName(),
    duration: faker.number.int({ min: 30, max: 600 }),
    methodId: methods[index % methods.length].id,
    userId: null,
    serverId: servers[index % servers.length].id,
    isStopped: faker.datatype.boolean(),
    options: {
      threads: faker.number.int({ min: 1, max: 16 }),
      rate: faker.number.int({ min: 100, max: 5000 }),
      region: faker.location.countryCode(),
    },
  })));

  await db.$client.end();
}

main().catch(async (error) => {
  console.error(error);
  await db.$client.end();
  process.exitCode = 1;
});
