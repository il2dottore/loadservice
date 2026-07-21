import 'reflect-metadata';
import * as argon2 from 'argon2';
import { DataSource } from 'typeorm';
import { Permission } from '../apps/auth/src/entities/permission.entity';
import { Role } from '../apps/auth/src/entities/role.entity';
import { User } from '../apps/auth/src/entities/user.entity';
import { UserRole } from '../apps/auth/src/entities/user-role.entity';
import { RolePermission } from '../apps/auth/src/entities/role-permission.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USER ?? 'postgres',
  password: process.env.DATABASE_PASS ?? 'postgres',
  database: 'auth_service_db',
  entities: [User, Role, Permission, UserRole, RolePermission],
  // Development convenience: create the auth schema before inserting seed data.
  // Use migrations instead of this in production.
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();

  try {
    const permissionRepository = dataSource.getRepository(Permission);
    const roleRepository = dataSource.getRepository(Role);
    const userRepository = dataSource.getRepository(User);
    const userRoleRepository = dataSource.getRepository(UserRole);
    const rolePermissionRepository = dataSource.getRepository(RolePermission);

    const permissionKeys = [
      'file:upload',
      'file:delete',
      'file:modify',
      'file:download',
    ];
    const permissions = new Map<string, Permission>();

    for (const key of permissionKeys) {
      let permission = await permissionRepository.findOneBy({ key });
      if (!permission) {
        permission = permissionRepository.create({ key });
        await permissionRepository.save(permission);
      }
      permissions.set(key, permission);
    }

    const rolePermissions: Record<string, string[]> = {
      USER: ['file:download'],
      MODERATOR: ['file:download', 'file:upload', 'file:modify'],
      ADMIN: permissionKeys,
    };
    const roles = new Map<string, Role>();

    for (const [name, keys] of Object.entries(rolePermissions)) {
      let role = await roleRepository.findOneBy({ name });
      if (!role) {
        role = roleRepository.create({ name });
        await roleRepository.save(role);
      }
      roles.set(name, role);

      for (const key of keys) {
        const permission = permissions.get(key)!;
        const existing = await rolePermissionRepository.findOne({
          where: { role: { id: role.id }, permission: { id: permission.id } },
        });
        if (!existing) {
          await rolePermissionRepository.save(
            rolePermissionRepository.create({ role, permission }),
          );
        }
      }
    }

    const password = await argon2.hash('Password123!');
    const users = [
      {
        email: 'user@example.com',
        firstName: 'Normal',
        lastName: 'User',
        role: 'USER',
      },
      {
        email: 'moderator@example.com',
        firstName: 'Site',
        lastName: 'Moderator',
        role: 'MODERATOR',
      },
      {
        email: 'admin@example.com',
        firstName: 'System',
        lastName: 'Admin',
        role: 'ADMIN',
      },
    ];

    for (const seedUser of users) {
      let user = await userRepository.findOneBy({ email: seedUser.email });
      if (!user) {
        user = userRepository.create({
          email: seedUser.email,
          firstName: seedUser.firstName,
          lastName: seedUser.lastName,
          password,
        });
        await userRepository.save(user);
      }

      const role = roles.get(seedUser.role)!;
      const existing = await userRoleRepository.findOne({
        where: { user: { id: user.id }, role: { id: role.id } },
      });
      if (!existing) {
        await userRoleRepository.save(
          userRoleRepository.create({ user, role }),
        );
      }
    }

    console.log('Auth seed completed. Password for all users: Password123!');
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((error) => {
  console.error('Auth seed failed:', error);
  process.exitCode = 1;
});
