import { faker } from '@faker-js/faker';
import { debugDb as createDebugDb } from './debugDatabase';
import { userEntity as usersTable } from '../apps/common/src/auth/src/entities/user.entity';
import { planEntity } from '../apps/common/src/plan/src/entities/plan.entity';
import { featureEntity } from '../apps/common/src/feature/src/entities/feature.entity';
import { Feature } from '../apps/common/src/feature/src/enums/feature.enum';
import { roleEntity } from '../apps/common/src/auth/src/entities/role.entity';
import { Role } from '../apps/common/src/auth/src/role/enums/role.enum';
import {
  permissionEntity as permissionsTable,
  rolePermissionEntity as rolesPermissionsTable,
} from '../apps/common/src/auth/src/entities/permission.entity';
import { userRoleEntity } from '../apps/common/src/auth/src/entities/user-role.entity';
import {
  methodsTable,
  OsiLayer,
} from '../apps/attack/src/entities/method.entity';
import { serverEntity as serversTable } from '../apps/attack/src/entities/server.entity';
import { usersPlansTable } from '../apps/common/src/plan/src/entities/plan.entity';
import { newsEntity } from '../apps/common/src/news/src/schemas/news.entity';
import {
  ticketEntity,
  TicketStatus,
  type TicketStatusValue,
} from '../apps/common/src/ticket/src/schemas/ticket.entity';
import { attackEntity } from '../apps/attack/src/entities/attack.entity';

const coreDatabase = process.env.CORE_SERVICE_DB ?? 'core_service_db';
const attackDatabase = process.env.ATTACK_SERVICE_DB ?? 'attack_service_db';
const debugCoreDb = createDebugDb(coreDatabase);
const debugAttackDb = createDebugDb(attackDatabase);

const users = [
  {
    email: 'Deshawn35@hotmail.com',
    firstName: 'Matthew',
    lastName: 'Vandervort',
    username: 'Louis82',
    phoneNumber: null,
    emailVerified: false,
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$gfGFI61IPNmxHBGOXX88uQ$npbc4H1r71uHzXFd45PMXv38KhnkKgI7D41/FWs9ro8',
  },
  {
    email: 'Lacey_Terry49@yahoo.com',
    firstName: 'Robyn',
    lastName: 'Effertz',
    username: 'Kristy_Kertzmann62',
    phoneNumber: null,
    emailVerified: true,
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$AtYsK/OWReKyz6Ize5F8Vg$p+1g5DMAhwMugEY0TG9/t68DeXmsQdIxNYr70RlC0LU',
  },
  {
    email: 'Salvatore_Thompson64@yahoo.com',
    firstName: 'Olive',
    lastName: 'Buckridge',
    username: 'Murphy.Johnson',
    phoneNumber: '+14276441889',
    emailVerified: false,
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$v5HGHlQ31vbUrKd+JS7K/w$CAdjuTAY61XFeqvpH8qcRwH5k3dyTSz4S1LVF4VPybA',
  },
  {
    email: 'Stephanie59@hotmail.com',
    firstName: 'Milton',
    lastName: 'Keebler',
    username: 'Estevan.Wintheiser',
    phoneNumber: '+18953498949',
    emailVerified: false,
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$W9o9/U3dpB4BKozO28kMXg$SqKpZgZswrGXaeaGnBo52/ewPQRW3krOztkW6PtymN8',
  },
  {
    email: 'Rodney56@yahoo.com',
    firstName: 'Lowell',
    lastName: 'Grimes',
    username: 'Carolyne_Ward32',
    phoneNumber: null,
    emailVerified: true,
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$msnEhwH0LX+itbUeE51jRA$g7eHRAsjKaXexV3BvR5+n4l2QK7UQPQZkkpGry8YHmY',
  },
  {
    email: 'Shari98@yahoo.com',
    firstName: 'Reanna',
    lastName: 'Corkery',
    username: 'Marguerite.Lueilwitz',
    phoneNumber: null,
    emailVerified: true,
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$Tv1uGd7vjtRMQK3XA4fOIw$p3fI+q2P5xzFXLdflJCz1A91yIQz4wZo3kx9RZMhKik',
  },
  {
    email: 'Delbert_Kris22@gmail.com',
    firstName: 'Cierra',
    lastName: 'Hilpert',
    username: 'Ian.Grimes',
    phoneNumber: '+12013972872',
    emailVerified: true,
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$jLUaYGvCgGP4xosoOVQBCA$Hy9ao7hSaXKe9hsbOUyu7r7jjCtAVhdExOS+hcs9V/Y',
  },
  {
    email: 'Jewel.Beatty@yahoo.com',
    firstName: 'Opal',
    lastName: 'Kunze',
    username: 'Kelley.Heller43',
    phoneNumber: '+16046507791',
    emailVerified: true,
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$W+AB/19bePwdTcSsIdCY7g$U8RtvZxiZnfBkqQTlWlysnIL8yiaoRhUHcInKGNaIH4',
  },
  {
    email: 'Makayla69@hotmail.com',
    firstName: 'Sheila',
    lastName: 'Orn-Parker',
    username: 'Lowell44',
    phoneNumber: '+19249536896',
    emailVerified: true,
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$imWvn8KnIaOXFAxkIqj9TQ$fYq6NDA1S36orqkzi9Tgx8V13+3OFCaooarG46HBveI',
  },
  {
    email: 'Marcos_Farrell57@yahoo.com',
    firstName: 'Duane',
    lastName: 'Herman',
    username: 'Stephany_Cremin66',
    phoneNumber: null,
    emailVerified: false,
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$WbP4WN82EcpjBXvPYuWehQ$sa3ymADymgvBdKu4td8kU9PODkhS+XARpj99Q4WIxBw',
  },
];

const permissionsSeed = [
  'ticket:read',
  'ticket:reply',
  'ticket:close',
  'ticket:delete',
  'news:create',
  'news:update',
  'news:delete',
];

const FREE_PLAN_EXPIRATION_DATE = new Date('2099-12-31T23:59:59.999Z');

function pickPlanDurationDays(planName: string) {
  if (planName === 'Basic') return 30;
  if (planName === 'Plus') return 45;
  if (planName === 'Pro') return 60;
  return 90;
}

async function usersTableSeeder() {
  await debugCoreDb.execute(`TRUNCATE TABLE users RESTART IDENTITY CASCADE;`);
  console.log('[START] Seeding users table...');
  await debugCoreDb.insert(usersTable).values(users);
  console.log('[DONE] Seeding users table');
}

async function rolesTableSeeder() {
  await debugCoreDb.execute(`TRUNCATE TABLE roles RESTART IDENTITY CASCADE;`);
  console.log('[START] Seeding roles table...');
  await debugCoreDb.insert(roleEntity).values([
    { key: Role.USER, displayName: Role.USER, description: 'Standard user' },
    {
      key: Role.SUPPORT,
      displayName: Role.SUPPORT,
      description: 'Support agent',
    },
    {
      key: Role.MANAGER,
      displayName: Role.MANAGER,
      description: 'Support manager',
    },
    {
      key: Role.ADMINISTRATOR,
      displayName: Role.ADMINISTRATOR,
      description: 'System administrator',
    },
  ]);
  console.log('[DONE] Seeding roles table');
}

async function permissionsTableSeeder() {
  await debugCoreDb.execute(
    `TRUNCATE TABLE permissions RESTART IDENTITY CASCADE;`,
  );
  console.log('[START] Seeding permissions table...');
  await debugCoreDb.insert(permissionsTable).values(
    permissionsSeed.map((permission) => ({
      key: permission,
      displayName: permission,
      description: `Permission: ${permission}`,
    })),
  );
  console.log('[DONE] Seeding permissions table');
}

async function rolesPermissionsTableSeeder() {
  await debugCoreDb.execute(
    `TRUNCATE TABLE roles_permissions RESTART IDENTITY CASCADE;`,
  );
  console.log('[START] Seeding roles_permissions table...');

  const roles = await debugCoreDb.select().from(roleEntity);

  for (const role of roles) {
    let rolePermissions: string[] = [];

    if (role.key === Role.SUPPORT) {
      rolePermissions = [
        'ticket:read',
        'ticket:reply',
        'ticket:close',
        'ticket:delete',
      ];
    }

    if (role.key === Role.MANAGER) {
      rolePermissions = [
        'ticket:read',
        'ticket:reply',
        'ticket:close',
        'ticket:delete',
        'news:create',
        'news:update',
        'news:delete',
      ];
    }

    if (role.key === Role.ADMINISTRATOR) {
      rolePermissions = permissionsSeed;
    }

    if (rolePermissions.length > 0) {
      await debugCoreDb.insert(rolesPermissionsTable).values(
        rolePermissions.map((permission) => ({
          roleKey: role.key,
          permissionKey: permission,
        })),
      );
    }
  }

  console.log('[DONE] Seeding roles_permissions table');
}

async function usersRolesTableSeeder() {
  await debugCoreDb.execute(
    `TRUNCATE TABLE users_roles RESTART IDENTITY CASCADE;`,
  );
  console.log('[START] Seeding users_roles table...');

  const users = await debugCoreDb.select().from(usersTable);
  const roles = await debugCoreDb.select().from(roleEntity);

  const userRole = roles.find((role) => role.key === Role.USER);
  const supportRole = roles.find((role) => role.key === Role.SUPPORT);
  const managerRole = roles.find((role) => role.key === Role.MANAGER);
  const adminRole = roles.find((role) => role.key === Role.ADMINISTRATOR);

  if (!userRole || !supportRole || !managerRole || !adminRole) {
    throw new Error('Required roles were not seeded correctly');
  }

  const userRoleAssignments = users.map((user, index) => {
    let roleKey = userRole.key;

    if (index === 0) {
      roleKey = adminRole.key;
    } else if (index <= 2) {
      roleKey = managerRole.key;
    } else if (index <= 4) {
      roleKey = supportRole.key;
    }

    return {
      userId: user.id,
      roleKey,
    };
  });

  await debugCoreDb.insert(userRoleEntity).values(userRoleAssignments);
  console.log('[DONE] Seeding users_roles table');
}

async function featuresTableSeeder() {
  await debugCoreDb.execute(
    `TRUNCATE TABLE features RESTART IDENTITY CASCADE;`,
  );
  console.log('[START] Seeding features table...');
  await debugCoreDb.insert(featureEntity).values([
    { id: Feature.ADVANCED_METHOD, name: 'ADVANCED METHODS ACCESS' },
    { id: Feature.API_ACCESS, name: 'API ACCESS' },
    { id: Feature.VIP_ACCESS, name: 'VIP ACCESS' },
  ]);
  console.log('[DONE] Seeding features table');
}

async function plansTableSeeder() {
  await debugCoreDb.execute(`TRUNCATE TABLE plans RESTART IDENTITY CASCADE;`);
  console.log('[START] Seeding plans table...');
  await debugCoreDb.insert(planEntity).values([
    {
      name: 'Free',
      price: 0,
      days: 36500,
      maxDuration: 60,
      maxConcurrents: 1,
      isCustom: false,
    },
    {
      name: 'Basic',
      price: 5000,
      days: 30,
      maxDuration: 120,
      maxConcurrents: 2,
      isCustom: false,
    },
    {
      name: 'Plus',
      price: 6000,
      days: 45,
      maxDuration: 300,
      maxConcurrents: 3,
      isCustom: false,
    },
    {
      name: 'Pro',
      price: 8000,
      days: 60,
      maxDuration: 300,
      maxConcurrents: 4,
      isCustom: false,
    },
    {
      name: 'Business',
      price: 10000,
      days: 90,
      maxDuration: 600,
      maxConcurrents: 10,
      isCustom: false,
    },
  ]);
  console.log('[DONE] Seeding plans table');
}

async function usersPlansTableSeeder() {
  await debugCoreDb.execute(
    `TRUNCATE TABLE users_plans RESTART IDENTITY CASCADE;`,
  );
  console.log('[START] Seeding users_plans table...');

  const users = await debugCoreDb.select().from(usersTable);
  const plans = await debugCoreDb.select().from(planEntity);

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
      expirationDate:
        plan.name === 'Free'
          ? FREE_PLAN_EXPIRATION_DATE
          : faker.date.soon({ days: pickPlanDurationDays(plan.name) }),
    };
  });

  await debugCoreDb.insert(usersPlansTable).values(userPlanAssignments);
  console.log('[DONE] Seeding users_plans table');
}

async function newsTableSeeder() {
  await debugCoreDb.execute(`TRUNCATE TABLE news RESTART IDENTITY CASCADE;`);
  console.log('[START] Seeding news table...');

  const users = await debugCoreDb.select().from(usersTable);

  await debugCoreDb.insert(newsEntity).values(
    Array.from({ length: 8 }).map((_, index) => ({
      title: faker.lorem.sentence({ min: 4, max: 8 }),
      content: faker.lorem.paragraphs({ min: 2, max: 4 }),
      authorId: users[index % users.length]?.id,
    })),
  );

  console.log('[DONE] Seeding news table');
}

async function ticketsTableSeeder() {
  await debugCoreDb.execute(`TRUNCATE TABLE tickets RESTART IDENTITY CASCADE;`);
  console.log('[START] Seeding tickets table...');

  const users = await debugCoreDb.select().from(usersTable);
  const userRoles = await debugCoreDb.select().from(userRoleEntity);
  const roles = await debugCoreDb.select().from(roleEntity);

  const supportroleKeys = roles
    .filter((role) =>
      [Role.SUPPORT, Role.MANAGER, Role.ADMINISTRATOR].includes(
        role.key as Role,
      ),
    )
    .map((role) => role.key);
  const supportUserIds = userRoles
    .filter((userRole) => supportroleKeys.includes(userRole.roleKey))
    .map((userRole) => userRole.userId);
  const supportUsers = users.filter((user) => supportUserIds.includes(user.id));

  const ticketStatuses: TicketStatusValue[] = [
    TicketStatus.OPEN,
    TicketStatus.IN_PROGRESS,
    TicketStatus.SOLVED,
  ];

  await debugCoreDb.insert(ticketEntity).values(
    Array.from({ length: 12 }).map((_, index) => {
      const status = ticketStatuses[index % ticketStatuses.length];
      const assignedSupportId =
        status === TicketStatus.OPEN
          ? null
          : (supportUsers[index % supportUsers.length]?.id ?? null);

      return {
        title: `Ticket #${index + 1}: ${faker.hacker.verb()} ${faker.hacker.noun()}`,
        content: faker.lorem.paragraphs({ min: 1, max: 3 }),
        status,
        senderId: users[index % users.length]?.id ?? null,
        assignedSupportId,
      };
    }),
  );

  console.log('[DONE] Seeding tickets table');
}

async function attacksTableSeeder() {
  await debugAttackDb.execute(
    `TRUNCATE TABLE attacks RESTART IDENTITY CASCADE;`,
  );
  console.log('[START] Seeding attacks table...');

  const users = await debugCoreDb.select().from(usersTable);
  const methods = await debugAttackDb.select().from(methodsTable);
  const servers = await debugAttackDb.select().from(serversTable);

  await debugAttackDb.insert(attackEntity).values(
    Array.from({ length: 15 }).map((_, index) => {
      const method = methods[index % methods.length];
      return {
        target: faker.internet.domainName(),
        duration: faker.number.int({ min: 30, max: 600 }),
        methodId: method?.id ?? null,
        userId: users[index % users.length]?.id ?? null,
        serverId: servers[index % servers.length]?.id ?? null,
        ...(method?.osiLayer === OsiLayer.LAYER_4
          ? {
              port: faker.number.int({ min: 1, max: 65535 }),
              ppsLimit: faker.number.int({ min: 100, max: 5000 }),
            }
          : {
              rateLimit: faker.number.int({ min: 100, max: 5000 }),
              requestMethod: 'GET' as const,
            }),
      };
    }),
  );

  console.log('[DONE] Seeding attacks table');
}

async function main() {
  await usersTableSeeder();

  await rolesTableSeeder();
  await permissionsTableSeeder();
  await rolesPermissionsTableSeeder();
  await usersRolesTableSeeder();

  await featuresTableSeeder();
  await plansTableSeeder();
  await usersPlansTableSeeder();

  await newsTableSeeder();
  await ticketsTableSeeder();

  await debugCoreDb.$client.end();
  await debugAttackDb.$client.end();
}

main();
