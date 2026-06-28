import type { AdminManagedUser, AdminPermission, AdminRole, AuthUser } from '~/types'

function uniqueBy<T>(items: T[], key: (item: T) => string | number) {
  const seen = new Set<string | number>()
  return items.filter((item) => {
    const value = key(item)
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

export function normalizeAuthUser(input: any, fallback?: Partial<AuthUser> | null): AuthUser | null {
  const source = input ?? fallback

  if (!source?.id) {
    return null
  }

  return {
    id: source.id,
    firstName: source.firstName ?? fallback?.firstName ?? '',
    lastName: source.lastName ?? fallback?.lastName ?? '',
    username: source.username ?? fallback?.username ?? '',
    email: source.email ?? fallback?.email ?? '',
    phoneNumber: source.phoneNumber ?? fallback?.phoneNumber ?? null,
    emailVerified: source.emailVerified ?? fallback?.emailVerified ?? false,
    roles: Array.isArray(source.roles) ? source.roles : (fallback?.roles ?? []),
    createdAt: source.createdAt ?? fallback?.createdAt,
    updatedAt: source.updatedAt ?? fallback?.updatedAt
  }
}

export function normalizeUserDetails(rows: any[], fallback?: Partial<AuthUser> | null): AdminManagedUser | null {
  const baseUser = rows[0]?.users ?? fallback

  if (!baseUser?.id) {
    return null
  }

  const roles = uniqueBy(
    rows
      .map(row => row?.roles?.name)
      .filter(Boolean),
    role => role
  ) as string[]

  return {
    id: baseUser.id,
    firstName: baseUser.firstName ?? fallback?.firstName ?? '',
    lastName: baseUser.lastName ?? fallback?.lastName ?? '',
    username: baseUser.username ?? fallback?.username ?? '',
    email: baseUser.email ?? fallback?.email ?? '',
    phoneNumber: baseUser.phoneNumber ?? fallback?.phoneNumber ?? null,
    emailVerified: baseUser.emailVerified ?? fallback?.emailVerified ?? false,
    roles,
    createdAt: baseUser.createdAt ?? fallback?.createdAt,
    updatedAt: baseUser.updatedAt ?? fallback?.updatedAt
  }
}

export function normalizeRoleDetail(rows: any[]): AdminRole | null {
  const baseRole = rows[0]?.roles

  if (!baseRole?.id) {
    return null
  }

  const permissions = uniqueBy(
    rows
      .map(row => row?.permissions)
      .filter(Boolean)
      .map((permission): AdminPermission => ({
        id: permission.id,
        createdAt: permission.createdAt,
        updatedAt: permission.updatedAt
      })),
    permission => permission.id
  )

  const users = uniqueBy(
    rows
      .map(row => row?.users)
      .filter(Boolean)
      .map((user): AdminManagedUser => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        emailVerified: user.emailVerified,
        roles: [baseRole.name],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })),
    user => user.id
  )

  return {
    id: baseRole.id,
    name: baseRole.name,
    createdAt: baseRole.createdAt,
    updatedAt: baseRole.updatedAt,
    permissions,
    users
  }
}
