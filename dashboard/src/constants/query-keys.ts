export const queryKeys = {
  auth: {
    profile: ['auth', 'profile'] as const,
    sessions: ['auth', 'sessions'] as const,
  },
  admin: {
    users: ['admin', 'users'] as const,
    networks: ['admin', 'networks'] as const,
    servers: ['admin', 'servers'] as const,
    plans: ['admin', 'plans'] as const,
    features: ['admin', 'features'] as const,
    roles: ['admin', 'roles'] as const,
    permissions: ['admin', 'permissions'] as const,
  },
} as const
