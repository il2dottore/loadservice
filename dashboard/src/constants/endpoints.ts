export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
    sessions: (userId: string) => `/auth/sessions/${userId}`,
    logout: '/auth/logout',
    logoutAll: '/auth/logout-all',
  },
  admin: {
    user: {
      list: '/users/details',
      count: '/users/count',
      details: (id: string) => `/users/${id}/details`,
      byId: (id: string) => `/users/${id}`,
    },
    network: {
      list: '/admin/networks',
      byId: (id: number) => `/admin/networks/${id}`,
      create: '/admin/networks',
      servers: (id: number) => `/admin/networks/${id}/servers`,
      server: (networkId: number, serverId: number) =>
        `/admin/networks/${networkId}/servers/${serverId}`,
    },
    server: {
      list: '/admin/servers',
      create: '/admin/servers',
      byId: (id: number) => `/admin/servers/${id}`,
    },
    plan: {
      list: '/admin/plans',
      byId: (id: number) => `/admin/plans/${id}`,
      create: '/admin/plans',
      features: (id: number) => `/admin/plans/${id}/features`,
      feature: (planId: number, featureId: string) =>
        `/admin/plans/${planId}/features/${featureId}`,
    },
    feature: {
      list: '/admin/features',
      create: '/admin/features',
      byId: (id: string) => `/admin/features/${id}`,
    },
    role: {
      list: '/admin/roles',
      byId: (id: number) => `/admin/roles/${id}`,
      create: '/admin/roles',
      permissions: (id: number) => `/admin/roles/${id}/permissions`,
      permission: (roleId: number, permissionId: string) =>
        `/admin/roles/${roleId}/permissions/${permissionId}`,
    },
    permission: {
      list: '/admin/permissions',
      create: '/admin/permissions',
      byId: (id: string) => `/admin/permissions/${id}`,
    },
  },
} as const
