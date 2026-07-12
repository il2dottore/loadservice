import { useMemo, useState } from 'react'
import { MoreHorizontal, Shield, Users2 } from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { adminRoles, adminUsers } from '../data/mock'

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function statusVariant(status: (typeof adminUsers)[number]['status']) {
  if (status === 'active') return 'default'
  if (status === 'invited') return 'secondary'
  return 'outline'
}

export function AdminUsers() {
  const [search, setSearch] = useState('')

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return adminUsers

    return adminUsers.filter((user) => {
      const haystack = [
        user.name,
        user.username,
        user.email,
        user.location,
        ...user.roles,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(keyword)
    })
  }, [search])

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
            <h2 className='text-2xl font-bold tracking-tight'>Admin Users</h2>
            <p className='text-muted-foreground'>
              Mock admin roster with role assignments and account states.
            </p>
          </div>
          <Button>Invite admin</Button>
        </div>

        <Card className='gap-0 overflow-hidden'>
          <CardHeader className='border-b bg-muted/30'>
            <div className='flex items-start gap-3'>
              <div className='flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                <Users2 className='size-5' />
              </div>
              <div className='space-y-1'>
                <CardTitle>Users</CardTitle>
                <CardDescription>
                  Browse admins, search by role, and inspect access at a glance.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='grid gap-4 pt-6'>
            <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder='Search by name, email, username, or role'
                className='md:max-w-sm'
              />
              <div className='flex flex-wrap gap-2'>
                {adminRoles.map((role) => (
                  <Badge key={role.id} variant='outline'>
                    {role.name} · {role.memberCount}
                  </Badge>
                ))}
              </div>
            </div>

            <div className='grid gap-3'>
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className='flex flex-col gap-4 rounded-xl border p-4 lg:flex-row lg:items-center lg:justify-between'
                >
                  <div className='flex items-start gap-4'>
                    <Avatar className='size-10'>
                      <AvatarFallback>{initials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className='space-y-2'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <p className='font-medium'>{user.name}</p>
                        <Badge variant={statusVariant(user.status)}>
                          {user.status}
                        </Badge>
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        <p>
                          @{user.username} · {user.email}
                        </p>
                        <p>
                          {user.location} · {user.lastSeen}
                        </p>
                      </div>
                      <div className='flex flex-wrap gap-2'>
                        {user.roles.map((role) => (
                          <Badge key={role} variant='outline'>
                            <Shield className='size-3' />
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon' aria-label='User actions'>
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem>View profile</DropdownMenuItem>
                      <DropdownMenuItem>Edit roles</DropdownMenuItem>
                      <DropdownMenuItem>Suspend access</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
