import { useLayout } from '@/providers/layout-provider'
import { useAuthStore } from '@/store/auth.store'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useProfile } from '@/features/auth/hooks/auth-hooks'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { AppTitle } from './app-title'

export function AppSidebar() {
  const { auth } = useAuthStore()
  const { collapsible, variant } = useLayout()
  const { data: profile } = useProfile(auth.accessToken)
  const activeUser = profile ?? auth.user

  const user = activeUser
    ? {
      name: `${activeUser.firstName} ${activeUser.lastName}`.trim(),
      email: activeUser.email,
      avatar: '',
    }
    : sidebarData.user

  const isAdmin = activeUser?.roles?.some((r) =>
    /admin|owner/i.test(`${r.key} ${r.displayName}`)
  )
  const canSupport = activeUser?.permissions?.some((p) =>
    ['ticket:reply', 'ticket:manage'].includes(p)
  )
  const navGroups = sidebarData.navGroups
    .filter((g) => g.title !== 'Admin' || isAdmin || canSupport)
    .map((group) =>
      group.title !== 'Admin' || isAdmin
        ? group
        : {
          ...group,
          items: group.items.filter(
            (item) => 'url' in item && item.url === '/admin/tickets'
          ),
        }
    )
  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <AppTitle />
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
