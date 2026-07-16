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
      update: (id: string) => `/users/${id}`,
      delete: (id: string) => `/users/${id}`,
      roles: {
        list: (userId: string) => `/users/${userId}/roles`,
        create: (userId: string, roleKey: string) =>
          `/users/${userId}/roles/${roleKey}`,
        byId: (userId: string, roleKey: string) =>
          `/users/${userId}/roles/${roleKey}`,
        update: (userId: string, roleKey: string) =>
          `/users/${userId}/roles/${roleKey}`,
        delete: (userId: string, roleKey: string) =>
          `/users/${userId}/roles/${roleKey}`,
      },
    },
    network: {
      list: '/networks',
      byId: (id: number) => `/networks/${id}`,
      create: '/networks',
      update: (id: number) => `/networks/${id}`,
      delete: (id: number) => `/networks/${id}`,
      servers: {
        list: (id: number) => `/networks/${id}/servers`,
        create: (networkId: number) => `/networks/${networkId}/servers`,
        byId: (networkId: number, serverId: number) =>
          `/networks/${networkId}/servers/${serverId}`,
        update: (networkId: number, serverId: number) =>
          `/networks/${networkId}/servers/${serverId}`,
        delete: (networkId: number, serverId: number) =>
          `/networks/${networkId}/servers/${serverId}`,
      },
    },
    server: {
      list: '/servers',
      status: '/servers/status',
      create: '/servers',
      byId: (id: number) => `/servers/${id}`,
      update: (id: number) => `/servers/${id}`,
      delete: (id: number) => `/servers/${id}`,
    },
    method: {
      list: '/methods',
      create: '/methods',
      update: (id: number) => `/methods/${id}`,
      delete: (id: number) => `/methods/${id}`,
      features: {
        create: (methodId: number, featureId: string) =>
          `/methods/${methodId}/features/${featureId}`,
        delete: (methodId: number, featureId: string) =>
          `/methods/${methodId}/features/${featureId}`,
      },
    },
    plan: {
      list: '/plans',
      byId: (id: number) => `/plans/${id}`,
      create: '/plans',
      update: (id: number) => `/plans/${id}`,
      delete: (id: number) => `/plans/${id}`,
      features: {
        list: (id: number) => `/plans/${id}/features`,
        create: (planId: number) => `/plans/${planId}/features`,
        byId: (planId: number, featureId: string) =>
          `/plans/${planId}/features/${featureId}`,
        update: (planId: number, featureId: string) =>
          `/plans/${planId}/features/${featureId}`,
        delete: (planId: number, featureId: string) =>
          `/plans/${planId}/features/${featureId}`,
      },
    },
    feature: {
      list: '/features',
      create: '/features',
      byId: (id: string) => `/features/${id}`,
      update: (id: string) => `/features/${id}`,
      delete: (id: string) => `/features/${id}`,
    },
    role: {
      list: '/roles',
      byKey: (roleKey: string) => `/roles/${roleKey}`,
      create: '/roles',
      update: (key: string) => `/roles/${key}`,
      delete: (key: string) => `/roles/${key}`,
      permissions: {
        list: (key: string) => `/roles/${key}/permissions`,
        create: (roleKey: string, permissionId: string) =>
          `/roles/${roleKey}/permissions/${permissionId}`,
        byId: (roleKey: string, permissionId: string) =>
          `/roles/${roleKey}/permissions/${permissionId}`,
        update: (roleKey: string, permissionId: string) =>
          `/roles/${roleKey}/permissions/${permissionId}`,
        delete: (roleKey: string, permissionId: string) =>
          `/roles/${roleKey}/permissions/${permissionId}`,
      },
    },
    permission: {
      list: '/permissions',
      create: '/permissions',
      byId: (id: string) => `/permissions/${id}`,
      update: (id: string) => `/permissions/${id}`,
      delete: (id: string) => `/permissions/${id}`,
    },
  },
  user: {
    allowedServers: (id: string) => `/users/${id}/allowed-servers`,
  },
} as const
