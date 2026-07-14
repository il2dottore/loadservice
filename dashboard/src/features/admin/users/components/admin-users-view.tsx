import { useMemo, useState } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Loader2, Pencil, Trash2, UserRound } from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import {
  DataTableColumnHeader,
  DataTablePagination,
  DataTableToolbar,
} from '@/components/data-table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { LongText } from '@/components/long-text'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAdminUsers, useAdminUserCount, useAdminUserDetails, useUpdateAdminUser, useDeleteAdminUser } from '../hooks/use-admin-users'

function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
}

type AdminUserRow = {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber: string
  status: 'active' | 'inactive'
  role: string
  plans: string[]
  raw: NonNullable<ReturnType<typeof useAdminUsers>['data']>[number]
}

function toAdminUserRows(users: NonNullable<ReturnType<typeof useAdminUsers>['data']> | undefined): AdminUserRow[] {
  if (!users) return []

  return users.map((item) => {
    const primaryRole = item.roles[0]?.displayName ?? item.roles[0]?.name ?? item.roles[0]?.key ?? 'User'
    return {
      id: item.user.id,
      firstName: item.user.firstName,
      lastName: item.user.lastName,
      username: item.user.username,
      email: item.user.email,
      phoneNumber: item.user.phoneNumber || '—',
      status: item.user.emailVerified ? 'active' : 'inactive',
      role: primaryRole,
      plans: item.plans.map((plan) => plan.name),
      raw: item,
    }
  })
}

export function AdminUsers() {
  const [detailUserId, setDetailUserId] = useState<string | null>(null)
  const [editUserId, setEditUserId] = useState<string | null>(null)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', username: '', email: '' })
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Do not request -1 here. The API interprets it as "all users" and then
  // loads details (roles/plans/permissions) for every user in parallel.
  // That makes both the response and the client-side table/faceting work
  // grow with the entire user base and can freeze the dev process.
  const [page, setPage] = useState(1)
  const pageSize = 5
  const { data: users, isLoading } = useAdminUsers(pageSize, page)
  const { data: total } = useAdminUserCount()
  const { data: userDetail } = useAdminUserDetails(detailUserId)
  const updateUser = useUpdateAdminUser()
  const deleteUser = useDeleteAdminUser()

  const data = useMemo(() => toAdminUserRows(users), [users])

  const columns = useMemo<ColumnDef<AdminUserRow>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
          className='translate-y-0.5'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
          className='translate-y-0.5'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'username',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Username' />
      ),
      cell: ({ row }) => (
        <LongText className='max-w-36 ps-3'>{row.getValue('username')}</LongText>
      ),
      enableHiding: false,
    },
    {
      id: 'fullName',
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Name' />
      ),
      cell: ({ row }) => (
        <LongText className='max-w-40'>{row.original.firstName} {row.original.lastName}</LongText>
      ),
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Email' />
      ),
      cell: ({ row }) => (
        <div className='w-fit ps-2 text-nowrap'>{row.getValue('email')}</div>
      ),
    },
    {
      accessorKey: 'phoneNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Phone Number' />
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const className = status === 'active'
          ? 'text-emerald-700 border-emerald-200 bg-emerald-50 dark:text-emerald-300 dark:border-emerald-900 dark:bg-emerald-950/40'
          : 'text-muted-foreground'
        return (
          <Badge variant='outline' className={className}>
            {status === 'active' ? 'Active' : 'Inactive'}
          </Badge>
        )
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
            >
              <DotsHorizontalIcon className='h-4 w-4' />
              <span className='sr-only'>Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => setDetailUserId(row.original.id)}>
              <UserRound />
              View detail
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEdit(row.original.raw)}>
              <Pencil />
              Edit profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant='destructive' onClick={() => setDeleteUserId(row.original.id)}>
              <Trash2 />
              Delete user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [users])

  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: { pageSize, pageIndex: page - 1 },
    },
    state: {
      sorting,
      rowSelection,
      columnVisibility,
      columnFilters,
      pagination: { pageIndex: page - 1, pageSize },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil((total ?? 0) / pageSize),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function openEdit(user: NonNullable<typeof users>[number]) {
    setEditUserId(user.user.id)
    setEditForm({
      firstName: user.user.firstName,
      lastName: user.user.lastName,
      username: user.user.username,
      email: user.user.email,
    })
  }

  function saveEdit() {
    if (!editUserId) return
    updateUser.mutate(
      { id: editUserId, input: editForm },
      { onSuccess: () => setEditUserId(null) },
    )
  }

  function confirmDelete() {
    if (!deleteUserId) return
    deleteUser.mutate(deleteUserId, { onSuccess: () => setDeleteUserId(null) })
  }

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
            <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
            <p className='text-muted-foreground'>Manage users, roles, and plans.</p>
          </div>
        </div>

        <div className='flex flex-1 flex-col gap-4'>
          <DataTableToolbar
            table={table}
            searchPlaceholder='Filter users...'
            searchKey='username'
            filters={[
              {
                columnId: 'status',
                title: 'Status',
                options: [
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
                ],
              },
            ]}
          />

          <div className='overflow-hidden rounded-md border'>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className='h-24 text-center'>
                      <Loader2 className='mx-auto size-6 animate-spin text-muted-foreground' />
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className='h-24 text-center'>
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <p className='text-sm text-muted-foreground'>
            {total ?? data.length} total users
          </p>
          <DataTablePagination table={table} className='mt-auto' onPageChange={setPage} />
        </div>
      </Main>

      {/* View detail dialog */}
      <Dialog open={!!detailUserId} onOpenChange={(open) => { if (!open) setDetailUserId(null) }}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {userDetail ? (
            <div className='space-y-4'>
              <div className='flex items-center gap-3'>
                <Avatar className='size-12'>
                  <AvatarFallback className='text-lg'>{initials(userDetail.user.firstName, userDetail.user.lastName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className='font-semibold text-lg'>{userDetail.user.firstName} {userDetail.user.lastName}</p>
                  <p className='text-sm text-muted-foreground'>@{userDetail.user.username}</p>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-3 text-sm'>
                <div>
                  <p className='text-muted-foreground'>Email</p>
                  <p className='font-medium break-all'>{userDetail.user.email}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Phone</p>
                  <p className='font-medium'>{userDetail.user.phoneNumber || '—'}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Email verified</p>
                  <p className='font-medium'>{userDetail.user.emailVerified ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Created</p>
                  <p className='font-medium'>{userDetail.user.createdAt ? new Date(userDetail.user.createdAt).toLocaleDateString() : '—'}</p>
                </div>
              </div>
              {userDetail.roles.length > 0 && (
                <div>
                  <p className='text-sm text-muted-foreground mb-1'>Roles</p>
                  <div className='flex flex-wrap gap-1.5'>
                    {userDetail.roles.map((role) => (
                      <Badge key={role.key} variant='outline'>{role.displayName ?? role.name ?? role.key}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {userDetail.roles_permissions.length > 0 && (
                <div>
                  <p className='text-sm text-muted-foreground mb-1'>Permissions</p>
                  <div className='flex flex-wrap gap-1.5'>
                    {userDetail.roles_permissions.map((permission) => (
                      <Badge key={permission.permission_id} variant='outline'>
                        {permission.permission_id}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {userDetail.plans.length > 0 && (
                <div>
                  <p className='text-sm text-muted-foreground mb-1'>Plans</p>
                  <div className='flex flex-wrap gap-1.5'>
                    {userDetail.plans.map((plan) => (
                      <Badge key={plan.id} variant='secondary'>{plan.name}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className='flex justify-center py-8'><Loader2 className='size-5 animate-spin text-muted-foreground' /></div>
          )}
          <DialogFooter>
            <Button variant='outline' onClick={() => setDetailUserId(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit profile dialog */}
      <Dialog open={!!editUserId} onOpenChange={(open) => { if (!open) setEditUserId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update the user's basic information.</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4'>
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-2'>
                <Label htmlFor='edit-first-name'>First name</Label>
                <Input id='edit-first-name' value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='edit-last-name'>Last name</Label>
                <Input id='edit-last-name' value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} />
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-username'>Username</Label>
              <Input id='edit-username' value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-email'>Email</Label>
              <Input id='edit-email' type='email' value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditUserId(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={updateUser.isPending}>
              {updateUser.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteUserId} onOpenChange={(open) => { if (!open) setDeleteUserId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              This action permanently removes the user and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteUserId(null)}>Cancel</Button>
            <Button variant='destructive' onClick={confirmDelete} disabled={deleteUser.isPending}>
              {deleteUser.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
