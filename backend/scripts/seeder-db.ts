import { faker } from '@faker-js/faker';
import { debugClient, debugDb } from './debugDatabase';
import { usersTable } from '../apps/gateways/user/schemas/user.schema';
import { plansTable } from '../apps/gateways/admin/plan/schemas/plan.schema';
import { featuresTable, plansFeaturesTable } from '../apps/gateways/admin/feature/schemas/feature.schema';
import { Feature, Plans } from '../apps/gateways/admin/feature/enums/feature.enum';
import { rolesTable } from '../apps/gateways/admin/role/schemas/role.schema';
import { Role } from '../apps/gateways/admin/role/enums/role.enum';
import { permissionsTable, rolesPermissionsTable } from '../apps/gateways/admin/permission/schemas/permission.schema';
import { usersRolesTable } from '../apps/gateways/admin/role/schemas/user-role.schema';
import { methodsTable, OsiLayer, type OsiLayerValue } from '../apps/gateways/admin/method/schemas/method.schema';
import { networksServersTable, networksTable } from '../apps/gateways/admin/network/schemas/network.schema';
import { serversTable } from '../apps/gateways/admin/server/schemas/server.schema';
import { usersPlansTable } from '../apps/gateways/admin/plan/schemas/plan.schema';
import { newsTable } from '../apps/gateways/news/schemas/news.schema';
import { ticketsTable, TicketStatus, type TicketStatusValue } from '../apps/gateways/ticket/schemas/ticket.schema';
import { attacksTable } from '../apps/gateways/attack/schemas/attack.schema';
import * as argon2 from 'argon2';

const permissionsSeed = [
  'ticket:read',
  'ticket:reply',
  'ticket:close',
  'ticket:delete',
  'news:create',
  'news:update',
  'news:delete'
];

const methodsSeed: Array<{ name: string; osiLayer: OsiLayerValue }> = [
  { name: 'UDP_FLOOD', osiLayer: OsiLayer.LAYER_4 },
  { name: 'TCP_SYN', osiLayer: OsiLayer.LAYER_4 },
  { name: 'HTTP_BYPASS', osiLayer: OsiLayer.LAYER_7 },
  { name: 'BROWSER_STORM', osiLayer: OsiLayer.LAYER_7 }
];

const networksSeed = [
  { name: 'Bronze Network', vipAccess: false },
  { name: 'Gold Network', vipAccess: false },
  { name: 'Diamond Network', vipAccess: true }
];

const serverNames = [
  { name: 'alpha-core', address: '10.10.0.10' },
  { name: 'beta-core', address: '10.10.0.11' },
  { name: 'gamma-edge', address: '10.10.1.10' },
  { name: 'delta-edge', address: '10.10.1.11' },
  { name: 'omega-premium', address: '10.10.2.10' }
];

const FREE_PLAN_EXPIRATION_DATE = new Date('2099-12-31T23:59:59.999Z');

function pickPlanDurationDays(planName: string) {
  if (planName === 'Basic') return 30;
  if (planName === 'Plus') return 45;
  if (planName === 'Pro') return 60;
  return 90;
}

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
      password: await argon2.hash('sussybakadeptrai'),
    });
  }
  console.log('[DONE] Seeding users table');
}

async function rolesTableSeeder() {
  await debugDb.execute(`TRUNCATE TABLE roles RESTART IDENTITY CASCADE;`);
  console.log('[START] Seeding roles table...');
  await debugDb.insert(rolesTable).values([
    { name: Role.USER },
    { name: Role.SUPPORT },
    { name: Role.MANAGER },
    { name: Role.ADMINISTRATOR }
  ]);
  console.log('[DONE] Seeding roles table');
}

async function permissionsTableSeeder() {
  await debugDb.execute(`TRUNCATE TABLE permissions RESTART IDENTITY CASCADE;`);
  console.log('[START] Seeding permissions table...');
  await debugDb.insert(permissionsTable).values(
    permissionsSeed.map((permission) => ({
      id: permission
    }))
  );
  console.log('[DONE] Seeding permissions table');
}

async function rolesPermissionsTableSeeder() {
  await debugDb.execute(`TRUNCATE TABLE roles_permissions RESTART IDENTITY CASCADE;`);
  console.log('[START] Seeding roles_permissions table...');

  const roles = await debugDb.select().from(rolesTable);

  for (const role of roles) {
    let rolePermissions: string[] = [];

    if (role.name === Role.SUPPORT) {
      rolePermissions = ['ticket:read', 'ticket:reply', 'ticket:close', 'ticket:delete'];
    }

    if (role.name === Role.MANAGER) {
      rolePermissions = [
        'ticket:read',
        'ticket:reply',
        'ticket:close',
        'ticket:delete',
        'news:create',
        'news:update',
        'news:delete'
      ];
    }

    if (role.name === Role.ADMINISTRATOR) {
      rolePermissions = permissionsSeed;
    }

    if (rolePermissions.length > 0) {
      await debugDb.insert(rolesPermissionsTable).values(
        rolePermissions.map((permission) => ({
          roleId: role.id,
          permissionId: permission
        }))
      );
    }
  }

  console.log('[DONE] Seeding roles_permissions table');
}

async function usersRolesTableSeeder() {
  await debugDb.execute(`TRUNCATE TABLE users_roles RESTART IDENTITY CASCADE;`);
  console.log('[START] Seeding users_roles table...');

  const users = await debugDb.select().from(usersTable);
  const roles = await debugDb.select().from(rolesTable);

  const userRole = roles.find((role) => role.name === Role.USER);
  const supportRole = roles.find((role) => role.name === Role.SUPPORT);
  const managerRole = roles.find((role) => role.name === Role.MANAGER);
  const adminRole = roles.find((role) => role.name === Role.ADMINISTRATOR);

  if (!userRole || !supportRole || !managerRole || !adminRole) {
    throw new Error('Required roles were not seeded correctly');
  }

  const userRoleAssignments = users.map((user, index) => {
    let roleId = userRole.id;

    if (index === 0) {
      roleId = adminRole.id;
    } else if (index <= 2) {
      roleId = managerRole.id;
    } else if (index <= 4) {
      roleId = supportRole.id;
    }

    return {
      userId: user.id,
      roleId
    };
  });

  await debugDb.insert(usersRolesTable).values(userRoleAssignments);
  console.log('[DONE] Seeding users_roles table');
}

async function methodsTableSeeder() {
  await debugDb.execute(`TRUNCATE TABLE methods RESTART IDENTITY CASCADE;`);
  console.log('[START] Seeding methods table...');
  await debugDb.insert(methodsTable).values(methodsSeed);
  console.log('[DONE] Seeding methods table');
}

async function networksTableSeeder() {
  await debugDb.execute(`TRUNCATE TABLE networks RESTART IDENTITY CASCADE;`);
  console.log('[START] Seeding networks table...');
  await debugDb.insert(networksTable).values(networksSeed);
  console.log('[DONE] Seeding networks table');
}

async function serversTableSeeder() {
  await debugDb.execute(`TRUNCATE TABLE servers RESTART IDENTITY CASCADE;`);
  console.log('[START] Seeding servers table...');
  await debugDb.insert(serversTable).values(
    serverNames.map((server) => ({
      name: server.name,
      address: server.address,
    }))
  );

  console.log('[DONE] Seeding servers table');
}

async function networksServersTableSeeder() {
  await debugDb.execute(`TRUNCATE TABLE networks_servers RESTART IDENTITY CASCADE;`);
  console.log('[START] Seeding networks_servers table...');

  const networks = await debugDb.select().from(networksTable);
  const servers = await debugDb.select().from(serversTable);

  await debugDb.insert(networksServersTable).values(
    servers.flatMap((server, index) => {
      const primaryNetwork = networks[index % networks.length];
      const extraNetwork = networks[(index + 1) % networks.length];

      return [
        {
          serverId: server.id,
          networkId: primaryNetwork.id,
        },
        ...(primaryNetwork.id === extraNetwork.id ? [] : [{
          serverId: server.id,
          networkId: extraNetwork.id,
        }]),
      ];
    }),
  );

  console.log('[DONE] Seeding networks_servers table');
}

async function featuresTableSeeder() {
  await debugDb.execute(`TRUNCATE TABLE features RESTART IDENTITY CASCADE;`);
  console.log('[START] Seeding features table...');
  await debugDb.insert(featuresTable).values([
    { id: Feature.FREE_LAYER_4, name: 'FREE LAYER 4' },
    { id: Feature.FREE_LAYER_7, name: 'FREE LAYER 7' },
    { id: Feature.ADVANCED_LAYER_4, name: 'ADVANCED LAYER 4' },
    { id: Feature.ADVANCED_LAYER_7, name: 'ADVANCED LAYER 7' },
    { id: Feature.API_ACCESS, name: 'API ACCESS' },
    { id: Feature.VIP_ACCESS, name: 'VIP ACCESS' }
  ]);
  console.log('[DONE] Seeding features table');
}

async function plansTableSeeder() {
  await debugDb.execute(`TRUNCATE TABLE plans RESTART IDENTITY CASCADE;`);
  console.log('[START] Seeding plans table...');
  await debugDb.insert(plansTable).values([
    {
      name: 'Free',
      price: 0,
      maxDuration: 1,
      maxConcurrents: 60,
      isCustom: false,
    },
    {
      name: 'Basic',
      price: 30,
      maxDuration: 120,
      maxConcurrents: 2,
      isCustom: false,
    },
    {
      name: 'Plus',
      price: 45,
      maxDuration: 300,
      maxConcurrents: 3,
      isCustom: false,
    },
    {
      name: 'Pro',
      price: 60,
      maxDuration: 300,
      maxConcurrents: 4,
      isCustom: false,
    },
    {
      name: 'Business',
      price: 100,
      maxDuration: 600,
      maxConcurrents: 10,
      isCustom: false,
    },
  ]);
  console.log('[DONE] Seeding plans table');
}

async function plansFeaturesTableSeeder() {
  await debugDb.execute(`TRUNCATE TABLE plans_features RESTART IDENTITY CASCADE;`);
  console.log('[START] Seeding plans_features table...');
  const plans = await debugDb.select().from(plansTable);
  const features = await debugDb.select().from(featuresTable);
  const featureIdById = new Map(features.map((feature) => [feature.id, feature.id]));
  for (const plan of plans) {
    if (plan.name === 'Free') {
      await debugDb.insert(plansFeaturesTable).values(Plans.FREE.map((feature) => ({
        planId: plan.id,
        featureId: featureIdById.get(feature)!,
      })));
    }
    if (plan.name === 'Basic') {
      await debugDb.insert(plansFeaturesTable).values(Plans.ADVANCED.map((feature) => ({
        planId: plan.id,
        featureId: featureIdById.get(feature)!,
      })));
    }
    if (plan.name === 'Plus') {
      await debugDb.insert(plansFeaturesTable).values(Plans.ADVANCED.map((feature) => ({
        planId: plan.id,
        featureId: featureIdById.get(feature)!,
      })));
    }
    if (plan.name === 'Pro') {
      await debugDb.insert(plansFeaturesTable).values(Plans.VIP.map((feature) => ({
        planId: plan.id,
        featureId: featureIdById.get(feature)!,
      })));
    }
    if (plan.name === 'Business') {
      await debugDb.insert(plansFeaturesTable).values(Plans.BUSINESS.map((feature) => ({
        planId: plan.id,
        featureId: featureIdById.get(feature)!,
      })));
    }
  }
  console.log('[DONE] Seeding plans_features table');
}

async function usersPlansTableSeeder() {
  await debugDb.execute(`TRUNCATE TABLE users_plans RESTART IDENTITY CASCADE;`);
  console.log('[START] Seeding users_plans table...');

  const users = await debugDb.select().from(usersTable);
  const plans = await debugDb.select().from(plansTable);

  const userPlanAssignments = users.map((user, index) => {
    const plan =
      index === 0
        ? plans.find((item) => item.name === 'Business')
        : index <= 2
          ? plans.find((item) => item.name === 'Pro')
          : index <= 5
            ? plans.find((item) => item.name === 'Plus')
            : index <= 7
              ? plans.find((item) => item.name === 'Basic')
              : plans.find((item) => item.name === 'Free');

    if (!plan) {
      throw new Error('Required plans were not seeded correctly');
    }

    return {
      userId: user.id,
      planId: plan.id,
      expirationDate: plan.name === 'Free'
        ? FREE_PLAN_EXPIRATION_DATE
        : faker.date.soon({ days: pickPlanDurationDays(plan.name) })
    };
  });

  await debugDb.insert(usersPlansTable).values(userPlanAssignments);
  console.log('[DONE] Seeding users_plans table');
}

async function newsTableSeeder() {
  await debugDb.execute(`TRUNCATE TABLE news RESTART IDENTITY CASCADE;`);
  console.log('[START] Seeding news table...');

  const users = await debugDb.select().from(usersTable);

  await debugDb.insert(newsTable).values(
    Array.from({ length: 8 }).map((_, index) => ({
      title: faker.lorem.sentence({ min: 4, max: 8 }),
      content: faker.lorem.paragraphs({ min: 2, max: 4 }),
      authorId: users[index % users.length]?.id
    }))
  );

  console.log('[DONE] Seeding news table');
}

async function ticketsTableSeeder() {
  await debugDb.execute(`TRUNCATE TABLE tickets RESTART IDENTITY CASCADE;`);
  console.log('[START] Seeding tickets table...');

  const users = await debugDb.select().from(usersTable);
  const userRoles = await debugDb.select().from(usersRolesTable);
  const roles = await debugDb.select().from(rolesTable);

  const supportRoleIds = roles
    .filter((role) => [Role.SUPPORT, Role.MANAGER, Role.ADMINISTRATOR].includes(role.name as Role))
    .map((role) => role.id);
  const supportUserIds = userRoles
    .filter((userRole) => supportRoleIds.includes(userRole.roleId))
    .map((userRole) => userRole.userId);
  const supportUsers = users.filter((user) => supportUserIds.includes(user.id));

  const ticketStatuses: TicketStatusValue[] = [
    TicketStatus.OPEN,
    TicketStatus.IN_PROGRESS,
    TicketStatus.SOLVED
  ];

  await debugDb.insert(ticketsTable).values(
    Array.from({ length: 12 }).map((_, index) => {
      const status = ticketStatuses[index % ticketStatuses.length];
      const assignedSupportId =
        status === TicketStatus.OPEN
          ? null
          : supportUsers[index % supportUsers.length]?.id ?? null;

      return {
        title: `Ticket #${index + 1}: ${faker.hacker.verb()} ${faker.hacker.noun()}`,
        content: faker.lorem.paragraphs({ min: 1, max: 3 }),
        status,
        senderId: users[index % users.length]?.id ?? null,
        assignedSupportId
      };
    })
  );

  console.log('[DONE] Seeding tickets table');
}

async function attacksTableSeeder() {
  await debugDb.execute(`TRUNCATE TABLE attacks RESTART IDENTITY CASCADE;`);
  console.log('[START] Seeding attacks table...');

  const users = await debugDb.select().from(usersTable);
  const methods = await debugDb.select().from(methodsTable);
  const servers = await debugDb.select().from(serversTable);

  await debugDb.insert(attacksTable).values(
    Array.from({ length: 15 }).map((_, index) => ({
      target: faker.internet.domainName(),
      duration: faker.number.int({ min: 30, max: 600 }),
      methodId: methods[index % methods.length]?.id ?? null,
      userId: users[index % users.length]?.id ?? null,
      serverId: servers[index % servers.length]?.id ?? null,
      isStopped: faker.datatype.boolean(),
      options: {
        threads: faker.number.int({ min: 1, max: 16 }),
        rate: faker.number.int({ min: 100, max: 5000 }),
        region: faker.location.countryCode()
      }
    }))
  );

  console.log('[DONE] Seeding attacks table');
}

async function main() {
  await usersTableSeeder();

  await rolesTableSeeder();
  await permissionsTableSeeder();
  await rolesPermissionsTableSeeder();
  await usersRolesTableSeeder();

  await methodsTableSeeder();
  await networksTableSeeder();
  await featuresTableSeeder();
  await serversTableSeeder();
  await networksServersTableSeeder();
  await plansTableSeeder();
  await plansFeaturesTableSeeder();
  await usersPlansTableSeeder();

  await newsTableSeeder();
  await ticketsTableSeeder();
  await attacksTableSeeder();

  await debugClient.end();
}

main();
