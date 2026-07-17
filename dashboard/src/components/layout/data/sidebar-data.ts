import {
  LayoutDashboard,
  Monitor,
  Shield,
  HelpCircle,
  Bell,
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
  teams: [
    /*
    {
      name: 'Shadcn Admin',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
    */
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        /*
        {
          title: 'Tasks',
          url: '/tasks',
          icon: ListTodo,
        },
        {
          title: 'Apps',
          url: '/apps',
          icon: Package,
        },
        {
          title: 'Chats',
          url: '/chats',
          badge: '3',
          icon: MessagesSquare,
        },
        {
          title: 'Users',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Secured by Clerk',
          icon: ClerkLogo,
          items: [
            {
              title: 'Sign In',
              url: '/clerk/sign-in',
            },
            {
              title: 'Sign Up',
              url: '/clerk/sign-up',
            },
            {
              title: 'User Management',
              url: '/clerk/user-management',
            },
          ],
        },
        */
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
    /**
    {
      title: 'Pages',
      items: [
        {
          title: 'Auth',
          icon: ShieldCheck,
          items: [
            {
              title: 'Sign In',
              url: '/sign-in',
            },
            {
              title: 'Sign In (2 Col)',
              url: '/sign-in-2',
            },
            {
              title: 'Sign Up',
              url: '/sign-up',
            },
            {
              title: 'Forgot Password',
              url: '/forgot-password',
            },
            {
              title: 'OTP',
              url: '/otp',
            },
          ],
        },
        {
          title: 'Errors',
          icon: Bug,
          items: [
            {
              title: 'Unauthorized',
              url: '/errors/unauthorized',
              icon: Lock,
            },
            {
              title: 'Forbidden',
              url: '/errors/forbidden',
              icon: UserX,
            },
            {
              title: 'Not Found',
              url: '/errors/not-found',
              icon: FileX,
            },
            {
              title: 'Internal Server Error',
              url: '/errors/internal-server-error',
              icon: ServerOff,
            },
            {
              title: 'Maintenance Error',
              url: '/errors/maintenance-error',
              icon: Construction,
            },
          ],
        },
      ],
    },
    */
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
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Security',
              url: '/settings/security',
              icon: KeyRound,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: Monitor,
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
