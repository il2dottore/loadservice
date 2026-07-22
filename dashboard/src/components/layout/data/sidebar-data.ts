import {
  LayoutDashboard,
  Shield,
  HelpCircle,
  Palette,
  Settings,
  UserCog,
  ShieldCheck,
  KeyRound,
  UserRoundCog,
  CreditCard,
  Globe2,
  Wrench,
  Server,
  Newspaper,
  Ticket,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Guest',
    email: 'guest@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Plans',
          url: '/plans',
          icon: CreditCard,
        },
        {
          title: 'Payments',
          url: '/payments',
          icon: CreditCard,
        },
        {
          title: 'Hub',
          url: '/hub',
          icon: ShieldCheck,
        },
        {
          title: 'Servers',
          url: '/servers',
          icon: Server,
        },
        { title: 'News', url: '/news', icon: Newspaper },
        { title: 'Tickets', url: '/tickets', icon: Ticket },
      ],
    },
    {
      title: 'Admin',
      items: [
        {
          title: 'Roles',
          url: '/admin/roles',
          icon: Shield,
        },
        {
          title: 'Plans',
          url: '/admin/plans',
          icon: CreditCard,
        },
        {
          title: 'Networks',
          url: '/admin/networks',
          icon: Globe2,
        },
        {
          title: 'Users',
          url: '/admin/users',
          icon: UserRoundCog,
        },
        {
          title: 'Methods',
          url: '/admin/methods',
          icon: Wrench,
        },
        {
          title: 'Attacks',
          url: '/admin/attacks',
          icon: ShieldCheck,
        },
        { title: 'News', url: '/admin/news', icon: Newspaper },
        { title: 'Tickets', url: '/admin/tickets', icon: Ticket },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Security',
              url: '/settings/security',
              icon: KeyRound,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
