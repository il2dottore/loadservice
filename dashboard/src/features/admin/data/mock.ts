export type AdminRole = {
  id: string
  name: string
  description: string
  memberCount: number
  permissions: string[]
}

export type AdminUser = {
  id: string
  name: string
  username: string
  email: string
  status: 'active' | 'invited' | 'suspended'
  lastSeen: string
  location: string
  roles: string[]
}

export const adminRoles: AdminRole[] = [
  {
    id: 'role_owner',
    name: 'Owner',
    description: 'Full workspace access including billing, security, and team management.',
    memberCount: 2,
    permissions: [
      'manage:billing',
      'manage:workspace',
      'manage:roles',
      'manage:users',
      'read:audit_logs',
    ],
  },
  {
    id: 'role_admin',
    name: 'Admin',
    description: 'Oversees members, roles, and internal operational workflows.',
    memberCount: 4,
    permissions: [
      'manage:users',
      'manage:roles',
      'read:analytics',
      'read:audit_logs',
    ],
  },
  {
    id: 'role_support',
    name: 'Support',
    description: 'Handles customer escalations and can inspect account status safely.',
    memberCount: 6,
    permissions: ['read:users', 'read:orders', 'manage:tickets'],
  },
  {
    id: 'role_analyst',
    name: 'Analyst',
    description: 'Views dashboards, exports reports, and monitors changes.',
    memberCount: 3,
    permissions: ['read:analytics', 'export:reports', 'read:users'],
  },
]

export const adminUsers: AdminUser[] = [
  {
    id: 'user_1',
    name: 'Mia Nguyen',
    username: 'mia.nguyen',
    email: 'mia@acme.io',
    status: 'active',
    lastSeen: 'Active now',
    location: 'Ho Chi Minh City, VN',
    roles: ['Owner', 'Admin'],
  },
  {
    id: 'user_2',
    name: 'Liam Carter',
    username: 'liam.carter',
    email: 'liam@acme.io',
    status: 'active',
    lastSeen: '12 minutes ago',
    location: 'Austin, US',
    roles: ['Admin'],
  },
  {
    id: 'user_3',
    name: 'Sophia Tran',
    username: 'sophia.tran',
    email: 'sophia@acme.io',
    status: 'invited',
    lastSeen: 'Invitation pending',
    location: 'Singapore, SG',
    roles: ['Support'],
  },
  {
    id: 'user_4',
    name: 'Noah Patel',
    username: 'noah.patel',
    email: 'noah@acme.io',
    status: 'active',
    lastSeen: '1 hour ago',
    location: 'London, UK',
    roles: ['Analyst'],
  },
  {
    id: 'user_5',
    name: 'Emma Pham',
    username: 'emma.pham',
    email: 'emma@acme.io',
    status: 'suspended',
    lastSeen: '4 days ago',
    location: 'Da Nang, VN',
    roles: ['Support', 'Analyst'],
  },
  {
    id: 'user_6',
    name: 'James Wilson',
    username: 'james.wilson',
    email: 'james@acme.io',
    status: 'active',
    lastSeen: 'Yesterday',
    location: 'Berlin, DE',
    roles: ['Admin', 'Support'],
  },
]
