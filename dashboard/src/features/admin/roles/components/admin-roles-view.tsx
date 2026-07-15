import { useState } from 'react'
import { Loader2, Pencil, Plus, ShieldCheck, Trash2, X } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { handleServerError } from '@/lib/handle-server-error'
import {
  useAssignPermission,
  useCreatePermission,
  useCreateRole,
  useDeletePermission,
  useDeleteRole,
  usePermissions,
  useRemovePermission,
  useRoleByKey,
  useRoles,
  useUpdatePermission,
  useUpdateRole,
} from '../hooks/use-admin-roles'
import type { Role } from '@/services/admin/roles/types'

export function AdminRoles() {
  const [selectedRoleKey, setSelectedRoleKey] = useState<string | null>(null)

  /* ── role queries ── */
  const { data: roles, isLoading: rolesLoading } = useRoles()
  const { data: roleDetail, isLoading: detailLoading } = useRoleByKey(selectedRoleKey)
  const { data: allPermissions, isLoading: permsLoading } = usePermissions()

  /* ── role mutations ── */
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()
  const assignPerm = useAssignPermission()
  const removePerm = useRemovePermission()

  /* ── permission mutations ── */
  const createPerm = useCreatePermission()
  const updatePerm = useUpdatePermission()
  const deletePerm = useDeletePermission()

  /* ── dialogs state ── */
  const [addRoleOpen, setAddRoleOpen] = useState(false)
  const [addRoleName, setAddRoleName] = useState('')

  const [editRoleOpen, setEditRoleOpen] = useState(false)
  const [editRoleTarget, setEditRoleTarget] = useState<Role | null>(null)
  const [editRoleName, setEditRoleName] = useState('')

  const [deleteRoleOpen, setDeleteRoleOpen] = useState(false)
  const [deleteRoleTarget, setDeleteRoleTarget] = useState<Role | null>(null)

  const [addPermToRole, setAddPermToRole] = useState('')

  const [editPermOpen, setEditPermOpen] = useState(false)
  const [editPermOldId, setEditPermOldId] = useState('')
  const [editPermNewId, setEditPermNewId] = useState('')

  const [deletePermOpen, setDeletePermOpen] = useState(false)
  const [deletePermTarget, setDeletePermTarget] = useState('')

  /* ── helpers ── */
  const assignedPerms = roleDetail?.permissionIds ?? []
  const availablePerms = (allPermissions ?? []).filter(
    (p) => !assignedPerms.includes(p.key),
  )

  /* ── handlers ── */
  function handleAddRole() {
    if (!addRoleName.trim()) return
    createRole.mutate({ key: addRoleName.trim().toUpperCase(), displayName: addRoleName.trim(), description: addRoleName.trim() }, {
      onSuccess: () => {
        setAddRoleOpen(false)
        setAddRoleName('')
      },
      onError: handleServerError,
    })
  }

  function openEditRole(role: Role) {
    setEditRoleTarget(role)
    setEditRoleName(role.displayName)
    setEditRoleOpen(true)
  }

  function handleEditRole() {
    if (!editRoleTarget || !editRoleName.trim()) return
    updateRole.mutate(
      { key: editRoleTarget.key, displayName: editRoleName.trim() },
      {
        onSuccess: () => setEditRoleOpen(false),
        onError: handleServerError,
      },
    )
  }

  function openDeleteRole(role: Role) {
    setDeleteRoleTarget(role)
    setDeleteRoleOpen(true)
  }

  function handleDeleteRole() {
    if (!deleteRoleTarget) return
    deleteRole.mutate(deleteRoleTarget.key, {
      onSuccess: () => {
        if (selectedRoleKey === deleteRoleTarget.key) setSelectedRoleKey(null)
        setDeleteRoleOpen(false)
      },
      onError: handleServerError,
    })
  }

  function handleAssignPermission() {
    if (!selectedRoleKey || !addPermToRole) return
    assignPerm.mutate(
      { roleKey: selectedRoleKey, permissionId: addPermToRole },
      {
        onSuccess: () => setAddPermToRole(''),
        onError: handleServerError,
      },
    )
  }

  function handleRemovePermission(permissionId: string) {
    if (!selectedRoleKey) return
    removePerm.mutate(
      { roleKey: selectedRoleKey, permissionId },
      { onError: handleServerError },
    )
  }

  function openEditPerm(id: string) {
    setEditPermOldId(id)
    setEditPermNewId(id)
    setEditPermOpen(true)
  }

  function handleEditPerm() {
    if (!editPermNewId.trim()) return
    updatePerm.mutate(
      { id: editPermOldId, newId: editPermNewId.trim() },
      {
        onSuccess: () => setEditPermOpen(false),
        onError: handleServerError,
      },
    )
  }

  function openDeletePerm(id: string) {
    setDeletePermTarget(id)
    setDeletePermOpen(true)
  }

  function handleDeletePerm() {
    if (!deletePermTarget) return
    deletePerm.mutate(deletePermTarget, {
      onSuccess: () => setDeletePermOpen(false),
      onError: handleServerError,
    })
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
            <h2 className='text-2xl font-bold tracking-tight'>Admin Roles</h2>
            <p className='text-muted-foreground'>
              Manage roles and their permission assignments.
            </p>
          </div>
          <Button onClick={() => setAddRoleOpen(true)}>
            <Plus className='me-1 size-4' />
            Add role
          </Button>
        </div>

        <div className='grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]'>
          {/* ── Roles sidebar ── */}
          <Card className='gap-0 overflow-hidden'>
            <CardHeader className='border-b bg-muted/30'>
              <CardTitle>Roles</CardTitle>
              <CardDescription>
                {roles?.length ?? 0} role{roles?.length !== 1 ? 's' : ''} total
              </CardDescription>
            </CardHeader>
            <CardContent className='grid gap-2 pt-4'>
              {rolesLoading ? (
                <div className='flex justify-center py-8'>
                  <Loader2 className='size-5 animate-spin text-muted-foreground' />
                </div>
              ) : !roles?.length ? (
                <p className='py-4 text-center text-sm text-muted-foreground'>
                  No roles yet
                </p>
              ) : (
                roles.map((role) => (
                  <div
                    key={role.key}
                    className={`group flex items-center justify-between rounded-xl border p-3 transition cursor-pointer ${
                      selectedRoleKey === role.key
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/40'
                    }`}
                    onClick={() => setSelectedRoleKey(role.key)}
                  >
                    <span className='text-sm font-medium truncate'>
                      {role.displayName}
                    </span>
                    <div
                      className='flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant='ghost'
                        size='icon'
                        className='size-7'
                        onClick={() => openEditRole(role)}
                      >
                        <Pencil className='size-3.5' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='size-7 text-destructive'
                        onClick={() => openDeleteRole(role)}
                      >
                        <Trash2 className='size-3.5' />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* ── Right: role detail + permission management ── */}
          <div className='grid gap-4'>
            {/* Role permissions */}
            <Card className='gap-0 overflow-hidden'>
              <CardHeader className='border-b bg-muted/30'>
                <div className='flex items-start gap-3'>
                  <div className='flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                    <ShieldCheck className='size-5' />
                  </div>
                  <div className='space-y-1 flex-1 min-w-0'>
                    <CardTitle className='truncate'>
                      {roleDetail?.role?.displayName ?? 'Select a role'}
                    </CardTitle>
                    <CardDescription>
                      {selectedRoleKey
                        ? `${assignedPerms.length} permission${assignedPerms.length !== 1 ? 's' : ''} assigned`
                        : 'Pick a role from the sidebar to manage its permissions'}
                    </CardDescription>
                  </div>
                  {roleDetail?.role && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => openEditRole(roleDetail.role)}
                    >
                      <Pencil className='me-1 size-3.5' />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className='space-y-4 pt-6'>
                {detailLoading ? (
                  <div className='flex justify-center py-8'>
                    <Loader2 className='size-5 animate-spin text-muted-foreground' />
                  </div>
                ) : !selectedRoleKey ? (
                  <p className='py-4 text-center text-sm text-muted-foreground'>
                    No role selected
                  </p>
                ) : (
                  <>
                    {/* Assigned permissions */}
                    {assignedPerms.length > 0 ? (
                      <div className='flex flex-wrap gap-2'>
                        {assignedPerms.map((perm) => (
                          <Badge
                            key={perm}
                            variant='outline'
                            className='gap-1.5 py-1.5 ps-3 pe-2'
                          >
                            {perm}
                            <button
                              type='button'
                              className='ml-0.5 rounded-full p-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors'
                              onClick={() => handleRemovePermission(perm)}
                            >
                              <X className='size-3' />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className='text-sm text-muted-foreground'>
                        No permissions assigned to this role.
                      </p>
                    )}

                    {/* Add permission to role */}
                    <div className='flex items-end gap-2'>
                      <div className='space-y-1.5 flex-1'>
                        <Label htmlFor='add-perm'>Add permission</Label>
                        <Select
                          value={addPermToRole}
                          onValueChange={setAddPermToRole}
                        >
                          <SelectTrigger id='add-perm' disabled={!availablePerms.length}>
                            <SelectValue placeholder={availablePerms.length ? 'Select permission...' : 'No available permissions'} />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePerms.map((p) => (
                              <SelectItem key={p.key} value={p.key}>
                                {p.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={handleAssignPermission}
                        disabled={!addPermToRole || assignPerm.isPending}
                      >
                        <Plus className='me-1 size-4' />
                        Assign
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* ── All permissions management ── */}
            <Card className='gap-0 overflow-hidden'>
              <CardHeader className='border-b bg-muted/30'>
                <div className='flex items-start gap-3'>
                  <div className='flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                    <ShieldCheck className='size-5' />
                  </div>
                  <div className='space-y-1 flex-1'>
                    <CardTitle>All Permissions</CardTitle>
                    <CardDescription>
                      {allPermissions?.length ?? 0} permission
                      {allPermissions?.length !== 1 ? 's' : ''} defined
                    </CardDescription>
                  </div>
                  <Button
                    size='sm'
                    onClick={() => {
                      setEditPermOldId('')
                      setEditPermNewId('')
                      setEditPermOpen(true)
                    }}
                  >
                    <Plus className='me-1 size-3.5' />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className='pt-6'>
                {permsLoading ? (
                  <div className='flex justify-center py-8'>
                    <Loader2 className='size-5 animate-spin text-muted-foreground' />
                  </div>
                ) : !allPermissions?.length ? (
                  <p className='py-4 text-center text-sm text-muted-foreground'>
                    No permissions defined yet
                  </p>
                ) : (
                  <div className='flex flex-wrap gap-2'>
                    {allPermissions.map((perm) => (
                      <Badge
                        key={perm.key}
                        variant='secondary'
                        className='gap-1.5 py-1.5 ps-3 pe-2'
                      >
                        {perm.displayName}
                        <button
                          type='button'
                          className='rounded-full p-0.5 text-muted-foreground hover:text-foreground transition-colors'
                          onClick={() => openEditPerm(perm.key)}
                        >
                          <Pencil className='size-3' />
                        </button>
                        <button
                          type='button'
                          className='rounded-full p-0.5 text-muted-foreground hover:text-destructive transition-colors'
                          onClick={() => openDeletePerm(perm.key)}
                        >
                          <Trash2 className='size-3' />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>

      {/* ── Add role dialog ── */}
      <Dialog open={addRoleOpen} onOpenChange={setAddRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Role</DialogTitle>
            <DialogDescription>Create a new role with a unique name.</DialogDescription>
          </DialogHeader>
          <div className='space-y-2'>
            <Label htmlFor='add-role-name'>Role name</Label>
            <Input
              id='add-role-name'
              value={addRoleName}
              onChange={(e) => setAddRoleName(e.target.value)}
              placeholder='e.g. Editor'
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddRole() }}
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setAddRoleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRole} disabled={createRole.isPending || !addRoleName.trim()}>
              {createRole.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit role dialog ── */}
      <Dialog open={editRoleOpen} onOpenChange={setEditRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Rename the role.</DialogDescription>
          </DialogHeader>
          <div className='space-y-2'>
            <Label htmlFor='edit-role-name'>Role name</Label>
            <Input
              id='edit-role-name'
              value={editRoleName}
              onChange={(e) => setEditRoleName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleEditRole() }}
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditRoleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditRole} disabled={updateRole.isPending || !editRoleName.trim()}>
              {updateRole.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete role dialog ── */}
      <Dialog open={deleteRoleOpen} onOpenChange={setDeleteRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              This permanently removes <strong>{deleteRoleTarget?.displayName}</strong> and its permission assignments. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteRoleOpen(false)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDeleteRole} disabled={deleteRole.isPending}>
              {deleteRole.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add / Edit permission dialog ── */}
      <Dialog
        open={editPermOpen}
        onOpenChange={(open) => {
          if (!open) setEditPermOpen(false)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editPermOldId ? 'Edit Permission' : 'Add Permission'}</DialogTitle>
            <DialogDescription>
              {editPermOldId
                ? 'Rename the permission identifier.'
                : 'Enter a unique permission identifier (e.g. manage:users).'}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-2'>
            <Label htmlFor='edit-perm-id'>Permission ID</Label>
            <Input
              id='edit-perm-id'
              value={editPermNewId}
              onChange={(e) => setEditPermNewId(e.target.value)}
              placeholder='e.g. manage:users'
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return
                if (editPermOldId) handleEditPerm()
                else if (editPermNewId.trim()) {
                  createPerm.mutate(editPermNewId.trim(), {
                    onSuccess: () => { setEditPermOpen(false); setEditPermNewId('') },
                    onError: handleServerError,
                  })
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditPermOpen(false)}>
              Cancel
            </Button>
            {editPermOldId ? (
              <Button onClick={handleEditPerm} disabled={updatePerm.isPending || !editPermNewId.trim()}>
                {updatePerm.isPending ? 'Saving...' : 'Save'}
              </Button>
            ) : (
              <Button onClick={() => {
                if (!editPermNewId.trim()) return
                createPerm.mutate(editPermNewId.trim(), {
                  onSuccess: () => {
                    setEditPermOpen(false)
                    setEditPermNewId('')
                  },
                  onError: handleServerError,
                })
              }} disabled={createPerm.isPending || !editPermNewId.trim()}>
                {createPerm.isPending ? 'Creating...' : 'Create'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete permission dialog ── */}
      <Dialog open={deletePermOpen} onOpenChange={setDeletePermOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Permission</DialogTitle>
            <DialogDescription>
              This permanently removes <strong>{deletePermTarget}</strong> and unassigns it from all roles. Cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeletePermOpen(false)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDeletePerm} disabled={deletePerm.isPending}>
              {deletePerm.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
