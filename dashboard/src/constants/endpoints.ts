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
        create: (userId: string, roleId: number) =>
          `/users/${userId}/roles/${roleId}`,
        byId: (userId: string, roleId: number) =>
          `/users/${userId}/roles/${roleId}`,
        update: (userId: string, roleId: number) =>
          `/users/${userId}/roles/${roleId}`,
        delete: (userId: string, roleId: number) =>
          `/users/${userId}/roles/${roleId}`,
      },
    },
    network: {
      list: '/admin/networks',
      byId: (id: number) => `/admin/networks/${id}`,
      create: '/admin/networks',
      update: (id: number) => `/admin/networks/${id}`,
      delete: (id: number) => `/admin/networks/${id}`,
      servers: {
        list: (id: number) => `/admin/networks/${id}/servers`,
        create: (networkId: number, serverId: number) =>
          `/admin/networks/${networkId}/servers/${serverId}`,
        byId: (networkId: number, serverId: number) =>
          `/admin/networks/${networkId}/servers/${serverId}`,
        update: (networkId: number, serverId: number) =>
          `/admin/networks/${networkId}/servers/${serverId}`,
        delete: (networkId: number, serverId: number) =>
          `/admin/networks/${networkId}/servers/${serverId}`,
      },
    },
    server: {
      list: '/admin/servers',
      create: '/admin/servers',
      byId: (id: number) => `/admin/servers/${id}`,
      update: (id: number) => `/admin/servers/${id}`,
      delete: (id: number) => `/admin/servers/${id}`,
    },
    plan: {
      list: '/admin/plans',
      byId: (id: number) => `/admin/plans/${id}`,
      create: '/admin/plans',
      update: (id: number) => `/admin/plans/${id}`,
      delete: (id: number) => `/admin/plans/${id}`,
      features: {
        list: (id: number) => `/admin/plans/${id}/features`,
        create: (planId: number, featureId: string) =>
          `/admin/plans/${planId}/features/${featureId}`,
        byId: (planId: number, featureId: string) =>
          `/admin/plans/${planId}/features/${featureId}`,
        update: (planId: number, featureId: string) =>
          `/admin/plans/${planId}/features/${featureId}`,
        delete: (planId: number, featureId: string) =>
          `/admin/plans/${planId}/features/${featureId}`,
      },
    },
    feature: {
      list: '/admin/features',
      create: '/admin/features',
      byId: (id: string) => `/admin/features/${id}`,
      update: (id: string) => `/admin/features/${id}`,
      delete: (id: string) => `/admin/features/${id}`,
    },
    role: {
      list: '/admin/roles',
      byId: (id: number) => `/admin/roles/${id}`,
      create: '/admin/roles',
      update: (id: number) => `/admin/roles/${id}`,
      delete: (id: number) => `/admin/roles/${id}`,
      permissions: {
        list: (id: number) => `/admin/roles/${id}/permissions`,
        create: (roleId: number, permissionId: string) =>
          `/admin/roles/${roleId}/permissions/${permissionId}`,
        byId: (roleId: number, permissionId: string) =>
          `/admin/roles/${roleId}/permissions/${permissionId}`,
        update: (roleId: number, permissionId: string) =>
          `/admin/roles/${roleId}/permissions/${permissionId}`,
        delete: (roleId: number, permissionId: string) =>
          `/admin/roles/${roleId}/permissions/${permissionId}`,
      },
    },
    permission: {
      list: '/admin/permissions',
      create: '/admin/permissions',
      byId: (id: string) => `/admin/permissions/${id}`,
      update: (id: string) => `/admin/permissions/${id}`,
      delete: (id: string) => `/admin/permissions/${id}`,
    },
  },
} as const
