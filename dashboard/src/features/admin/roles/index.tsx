import { useMemo, useState } from 'react'
import { ShieldCheck, Users2 } from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { adminRoles, adminUsers } from '../data/mock'

export function AdminRoles() {
  const [selectedRoleId, setSelectedRoleId] = useState(adminRoles[0]?.id ?? '')

  const selectedRole = useMemo(
    () => adminRoles.find((role) => role.id === selectedRoleId) ?? adminRoles[0],
    [selectedRoleId]
  )

  const assignedUsers = useMemo(
    () =>
      adminUsers.filter((user) => user.roles.includes(selectedRole?.name ?? '')),
    [selectedRole]
  )

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Admin Roles</h2>
            <p className='text-muted-foreground'>
              Mock role management for permissions and team assignments.
            </p>
          </div>
          <Button>Add role</Button>
        </div>

        <div className='grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]'>
          <Card className='gap-0 overflow-hidden'>
            <CardHeader className='border-b bg-muted/30'>
              <CardTitle>Roles</CardTitle>
              <CardDescription>
                Pick a role to inspect its access and assigned admins.
              </CardDescription>
            </CardHeader>
            <CardContent className='grid gap-3 pt-6'>
              {adminRoles.map((role) => (
                <button
                  key={role.id}
                  type='button'
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`rounded-xl border p-4 text-left transition ${
                    selectedRole?.id === role.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/40'
                  }`}
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='space-y-1'>
                      <p className='font-medium'>{role.name}</p>
                      <p className='text-sm text-muted-foreground'>
                        {role.description}
                      </p>
                    </div>
                    <Badge variant='outline'>{role.memberCount}</Badge>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <div className='grid gap-4'>
            <Card className='gap-0 overflow-hidden'>
              <CardHeader className='border-b bg-muted/30'>
                <div className='flex items-start gap-3'>
                  <div className='flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                    <ShieldCheck className='size-5' />
                  </div>
                  <div className='space-y-1'>
                    <CardTitle>{selectedRole?.name} permissions</CardTitle>
                    <CardDescription>{selectedRole?.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='grid gap-3 pt-6 sm:grid-cols-2 xl:grid-cols-3'>
                {selectedRole?.permissions.map((permission) => (
                  <div
                    key={permission}
                    className='rounded-xl border border-dashed p-4 text-sm'
                  >
                    <p className='font-medium'>{permission}</p>
                    <p className='mt-1 text-muted-foreground'>
                      Mock permission attached to this role.
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className='gap-0 overflow-hidden'>
              <CardHeader className='border-b bg-muted/30'>
                <div className='flex items-start gap-3'>
                  <div className='flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                    <Users2 className='size-5' />
                  </div>
                  <div className='space-y-1'>
                    <CardTitle>Assigned users</CardTitle>
                    <CardDescription>
                      People currently carrying the {selectedRole?.name} role.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='grid gap-3 pt-6'>
                {assignedUsers.map((user) => (
                  <div
                    key={user.id}
                    className='flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between'
                  >
                    <div>
                      <p className='font-medium'>{user.name}</p>
                      <p className='text-sm text-muted-foreground'>
                        @{user.username} · {user.email}
                      </p>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      {user.roles.map((role) => (
                        <Badge key={role} variant={role === selectedRole?.name ? 'default' : 'outline'}>
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
}
