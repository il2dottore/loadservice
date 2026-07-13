import { useLayout } from '@/providers/layout-provider'
import { useAuthStore } from '@/store/auth.store'
import { useProfile } from '@/features/auth/hooks/auth-hooks'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
// import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'

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

  const isAdmin = activeUser?.roles?.some((r) => /admin|owner/i.test(r.name))
  const navGroups = isAdmin
    ? sidebarData.navGroups
    : sidebarData.navGroups.filter((g) => g.title !== 'Admin')
  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />

        {/* Replace <TeamSwitch /> with the following <AppTitle />
         /* if you want to use the normal app title instead of TeamSwitch dropdown */}
        {/* <AppTitle /> */}
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
