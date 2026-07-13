import { useState } from 'react'
import { Globe, Loader2, Pencil, Plus, Server, Trash2, X } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { handleServerError } from '@/lib/handle-server-error'
import {
  useAssignServer,
  useCreateNetwork,
  useCreateServer,
  useDeleteNetwork,
  useDeleteServer,
  useNetworkById,
  useNetworks,
  useRemoveServer,
  useServers,
  useUpdateNetwork,
  useUpdateServer,
} from './api/hooks'
import type { Network } from './api/types'

export function AdminNetworks() {
  const [selectedNetworkId, setSelectedNetworkId] = useState<number | null>(null)

  /* ── queries ── */
  const { data: networks, isLoading: networksLoading } = useNetworks()
  const { data: networkDetail, isLoading: detailLoading } = useNetworkById(selectedNetworkId)
  const { data: allServers } = useServers()

  /* ── mutations ── */
  const createNetwork = useCreateNetwork()
  const updateNetwork = useUpdateNetwork()
  const deleteNetwork = useDeleteNetwork()
  const assignServer = useAssignServer()
  const removeServer = useRemoveServer()

  /* ── server mutations ── */
  const createServer = useCreateServer()
  const updateServer = useUpdateServer()
  const deleteServer = useDeleteServer()

  /* ── dialogs ── */
  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', vipAccess: false })

  const [editOpen, setEditOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Network | null>(null)
  const [editForm, setEditForm] = useState({ name: '', vipAccess: false })

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Network | null>(null)

  const [addServerToNetwork, setAddServerToNetwork] = useState('')
  const [serverSearch, setServerSearch] = useState('')

  /* ── server dialog states ── */
  const [serverDialogOpen, setServerDialogOpen] = useState(false)
  const [serverDialogMode, setServerDialogMode] = useState<'add' | 'edit'>('add')
  const [serverForm, setServerForm] = useState({ name: '', address: '' })
  const [serverEditId, setServerEditId] = useState<number | null>(null)

  const [deleteServerOpen, setDeleteServerOpen] = useState(false)
  const [deleteServerTarget, setDeleteServerTarget] = useState<{ id: number; name: string } | null>(null)

  /* ── helpers ── */
  const assignedServers = networkDetail?.servers ?? []
  const assignedServerIds = new Set(assignedServers.map((s) => s.id))
  const availableServers = (allServers ?? []).filter((s) => !assignedServerIds.has(s.id))
  const filteredServers = availableServers.filter(
    (s) => s.name.toLowerCase().includes(serverSearch.toLowerCase()) ||
           s.address.toLowerCase().includes(serverSearch.toLowerCase()),
  )

  /* ── handlers ── */
  function handleAdd() {
    if (!addForm.name.trim()) return
    createNetwork.mutate(
      { name: addForm.name.trim(), vipAccess: addForm.vipAccess },
      {
        onSuccess: () => { setAddOpen(false); setAddForm({ name: '', vipAccess: false }) },
        onError: handleServerError,
      },
    )
  }

  function openEdit(network: Network) {
    setEditTarget(network)
    setEditForm({ name: network.name, vipAccess: network.vipAccess })
    setEditOpen(true)
  }

  function handleEdit() {
    if (!editTarget || !editForm.name.trim()) return
    updateNetwork.mutate(
      { id: editTarget.id, data: { name: editForm.name.trim(), vipAccess: editForm.vipAccess } },
      {
        onSuccess: () => setEditOpen(false),
        onError: handleServerError,
      },
    )
  }

  function openDelete(network: Network) {
    setDeleteTarget(network)
    setDeleteOpen(true)
  }

  function handleDelete() {
    if (!deleteTarget) return
    deleteNetwork.mutate(deleteTarget.id, {
      onSuccess: () => {
        if (selectedNetworkId === deleteTarget.id) setSelectedNetworkId(null)
        setDeleteOpen(false)
      },
      onError: handleServerError,
    })
  }

  function handleAssignServer() {
    if (!selectedNetworkId || !addServerToNetwork) return
    assignServer.mutate(
      { networkId: selectedNetworkId, serverId: Number(addServerToNetwork) },
      {
        onSuccess: () => setAddServerToNetwork(''),
        onError: handleServerError,
      },
    )
  }

  function handleRemoveServer(serverId: number) {
    if (!selectedNetworkId) return
    removeServer.mutate(
      { networkId: selectedNetworkId, serverId },
      { onError: handleServerError },
    )
  }

  /* ── server handlers ── */
  function openAddServer() {
    setServerDialogMode('add')
    setServerForm({ name: '', address: '' })
    setServerEditId(null)
    setServerDialogOpen(true)
  }

  function openEditServer(id: number, name: string, address: string) {
    setServerDialogMode('edit')
    setServerForm({ name, address })
    setServerEditId(id)
    setServerDialogOpen(true)
  }

  function handleSaveServer() {
    if (!serverForm.name.trim() || !serverForm.address.trim()) return
    if (serverDialogMode === 'add') {
      createServer.mutate(
        { name: serverForm.name.trim(), address: serverForm.address.trim() },
        {
          onSuccess: () => setServerDialogOpen(false),
          onError: handleServerError,
        },
      )
    } else if (serverEditId !== null) {
      updateServer.mutate(
        { id: serverEditId, data: { name: serverForm.name.trim(), address: serverForm.address.trim() } },
        {
          onSuccess: () => setServerDialogOpen(false),
          onError: handleServerError,
        },
      )
    }
  }

  function openDeleteServer(id: number, name: string) {
    setDeleteServerTarget({ id, name })
    setDeleteServerOpen(true)
  }

  function handleDeleteServer() {
    if (!deleteServerTarget) return
    deleteServer.mutate(deleteServerTarget.id, {
      onSuccess: () => setDeleteServerOpen(false),
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
            <h2 className='text-2xl font-bold tracking-tight'>Admin Networks</h2>
            <p className='text-muted-foreground'>
              Manage networks and their server assignments.
            </p>
          </div>
          <Button onClick={() => { setAddForm({ name: '', vipAccess: false }); setAddOpen(true) }}>
            <Plus className='me-1 size-4' />
            Add network
          </Button>
        </div>

        <div className='grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]'>
          {/* ── Networks sidebar ── */}
          <Card className='gap-0 overflow-hidden'>
            <CardHeader className='border-b bg-muted/30'>
              <CardTitle>Networks</CardTitle>
              <CardDescription>
                {networks?.length ?? 0} network{networks?.length !== 1 ? 's' : ''} total
              </CardDescription>
            </CardHeader>
            <CardContent className='grid gap-2 pt-4'>
              {networksLoading ? (
                <div className='flex justify-center py-8'>
                  <Loader2 className='size-5 animate-spin text-muted-foreground' />
                </div>
              ) : !networks?.length ? (
                <p className='py-4 text-center text-sm text-muted-foreground'>
                  No networks yet
                </p>
              ) : (
                networks.map((network) => (
                  <div
                    key={network.id}
                    className={`group flex items-center justify-between rounded-xl border p-3 transition cursor-pointer ${
                      selectedNetworkId === network.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/40'
                    }`}
                    onClick={() => setSelectedNetworkId(network.id)}
                  >
                    <div className='min-w-0'>
                      <p className='text-sm font-medium truncate'>{network.name}</p>
                      <p className='text-xs text-muted-foreground'>
                        {network.vipAccess ? 'VIP' : 'Standard'}
                      </p>
                    </div>
                    <div
                      className='flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant='ghost' size='icon' className='size-7' onClick={() => openEdit(network)}>
                        <Pencil className='size-3.5' />
                      </Button>
                      <Button variant='ghost' size='icon' className='size-7 text-destructive' onClick={() => openDelete(network)}>
                        <Trash2 className='size-3.5' />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* ── Right: network detail + servers ── */}
          <div className='grid gap-4'>
            {/* Network servers */}
            <Card className='gap-0 overflow-hidden'>
              <CardHeader className='border-b bg-muted/30'>
                <div className='flex items-start gap-3'>
                  <div className='flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                    <Globe className='size-5' />
                  </div>
                  <div className='space-y-1 flex-1 min-w-0'>
                    <CardTitle className='truncate'>
                      {networkDetail?.network?.name ?? 'Select a network'}
                    </CardTitle>
                    <CardDescription>
                      {selectedNetworkId
                        ? `${assignedServers.length} server${assignedServers.length !== 1 ? 's' : ''} assigned`
                        : 'Pick a network from the sidebar to manage its servers'}
                    </CardDescription>
                  </div>
                  {networkDetail?.network && (
                    <Button variant='outline' size='sm' onClick={() => openEdit(networkDetail.network)}>
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
                ) : !selectedNetworkId ? (
                  <p className='py-4 text-center text-sm text-muted-foreground'>
                    No network selected
                  </p>
                ) : (
                  <>
                    {/* Network info */}
                    {networkDetail?.network && (
                      <div className='flex items-center gap-2 text-sm'>
                        <Badge variant={networkDetail.network.vipAccess ? 'default' : 'secondary'}>
                          {networkDetail.network.vipAccess ? 'VIP Access' : 'Standard'}
                        </Badge>
                      </div>
                    )}

                    {/* Assigned servers */}
                    {assignedServers.length > 0 ? (
                      <div className='grid gap-2'>
                        {assignedServers.map((server) => (
                          <div
                            key={server.id}
                            className='flex items-center justify-between rounded-lg border p-3'
                          >
                            <div className='min-w-0'>
                              <p className='text-sm font-medium truncate'>{server.name}</p>
                              <p className='text-xs text-muted-foreground truncate'>{server.address}</p>
                            </div>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='size-7 text-muted-foreground hover:text-destructive shrink-0'
                              onClick={() => handleRemoveServer(server.id)}
                            >
                              <X className='size-4' />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className='text-sm text-muted-foreground'>
                        No servers assigned to this network.
                      </p>
                    )}

                    {/* Add server to network */}
                    <div className='flex items-end gap-2'>
                      <div className='space-y-1.5 flex-1'>
                        <Label htmlFor='add-server'>Add server</Label>
                        <Select
                          value={addServerToNetwork}
                          onValueChange={(v) => { setAddServerToNetwork(v); setServerSearch('') }}
                        >
                          <SelectTrigger id='add-server' disabled={!availableServers.length}>
                            <SelectValue placeholder={availableServers.length ? 'Select server...' : 'No available servers'} />
                          </SelectTrigger>
                          <SelectContent>
                            <div className='px-2 pb-2 pt-1' onClick={(e) => e.stopPropagation()}>
                              <Input
                                placeholder='Search servers...'
                                value={serverSearch}
                                onChange={(e) => setServerSearch(e.target.value)}
                                className='h-8'
                              />
                            </div>
                            {filteredServers.length > 0 ? (
                              filteredServers.map((s) => (
                                <SelectItem key={s.id} value={String(s.id)}>
                                  {s.name} ({s.address})
                                </SelectItem>
                              ))
                            ) : (
                              <div className='px-2 py-4 text-center text-sm text-muted-foreground'>
                                {serverSearch ? 'No matching servers' : 'No available servers'}
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleAssignServer} disabled={!addServerToNetwork || assignServer.isPending}>
                        <Plus className='me-1 size-4' />
                        Assign
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* ── All servers management ── */}
            <Card className='gap-0 overflow-hidden'>
              <CardHeader className='border-b bg-muted/30'>
                <div className='flex items-start gap-3'>
                  <div className='flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                    <Server className='size-5' />
                  </div>
                  <div className='space-y-1 flex-1'>
                    <CardTitle>All Servers</CardTitle>
                    <CardDescription>
                      {allServers?.length ?? 0} server{allServers?.length !== 1 ? 's' : ''} available
                    </CardDescription>
                  </div>
                  <Button size='sm' onClick={openAddServer}>
                    <Plus className='me-1 size-3.5' />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className='pt-6'>
                {!allServers?.length ? (
                  <p className='py-4 text-center text-sm text-muted-foreground'>
                    No servers defined yet
                  </p>
                ) : (
                  <div className='grid gap-2 sm:grid-cols-2 xl:grid-cols-3'>
                    {allServers.map((server) => (
                      <div key={server.id} className='group flex items-center justify-between rounded-lg border p-3'>
                        <div className='min-w-0'>
                          <p className='text-sm font-medium truncate'>{server.name}</p>
                          <p className='text-xs text-muted-foreground truncate'>{server.address}</p>
                        </div>
                        <div className='flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0'>
                          <button
                            type='button'
                            className='rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors'
                            onClick={() => openEditServer(server.id, server.name, server.address)}
                          >
                            <Pencil className='size-3.5' />
                          </button>
                          <button
                            type='button'
                            className='rounded-full p-1 text-muted-foreground hover:text-destructive transition-colors'
                            onClick={() => openDeleteServer(server.id, server.name)}
                          >
                            <Trash2 className='size-3.5' />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>

      {/* ── Add network dialog ── */}
      <Dialog open={addOpen} onOpenChange={(open) => { if (!open) setAddOpen(false) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Network</DialogTitle>
            <DialogDescription>Create a new network.</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='add-name'>Name</Label>
              <Input id='add-name' value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} placeholder='e.g. Premium Network' />
            </div>
            <div className='flex items-center gap-2'>
              <Switch id='add-vip' checked={addForm.vipAccess} onCheckedChange={(v) => setAddForm({ ...addForm, vipAccess: v })} />
              <Label htmlFor='add-vip'>VIP Access</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={createNetwork.isPending || !addForm.name.trim()}>
              {createNetwork.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit network dialog ── */}
      <Dialog open={editOpen} onOpenChange={(open) => { if (!open) setEditOpen(false) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Network</DialogTitle>
            <DialogDescription>Update network details.</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-name'>Name</Label>
              <Input id='edit-name' value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className='flex items-center gap-2'>
              <Switch id='edit-vip' checked={editForm.vipAccess} onCheckedChange={(v) => setEditForm({ ...editForm, vipAccess: v })} />
              <Label htmlFor='edit-vip'>VIP Access</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={updateNetwork.isPending || !editForm.name.trim()}>
              {updateNetwork.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete network dialog ── */}
      <Dialog open={deleteOpen} onOpenChange={(open) => { if (!open) setDeleteOpen(false) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Network</DialogTitle>
            <DialogDescription>
              This permanently removes <strong>{deleteTarget?.name}</strong> and unassigns all its servers. Cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant='destructive' onClick={handleDelete} disabled={deleteNetwork.isPending}>
              {deleteNetwork.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add / Edit server dialog ── */}
      <Dialog open={serverDialogOpen} onOpenChange={(open) => { if (!open) setServerDialogOpen(false) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{serverDialogMode === 'add' ? 'Add Server' : 'Edit Server'}</DialogTitle>
            <DialogDescription>
              {serverDialogMode === 'add'
                ? 'Create a new server with a name and address.'
                : 'Update the server name and address.'}
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='server-name'>Name</Label>
              <Input
                id='server-name'
                value={serverForm.name}
                onChange={(e) => setServerForm({ ...serverForm, name: e.target.value })}
                placeholder='e.g. US-East-1'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='server-address'>Address</Label>
              <Input
                id='server-address'
                value={serverForm.address}
                onChange={(e) => setServerForm({ ...serverForm, address: e.target.value })}
                placeholder='e.g. 192.168.1.1'
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveServer() }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setServerDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveServer} disabled={(serverDialogMode === 'add' ? createServer : updateServer).isPending || !serverForm.name.trim() || !serverForm.address.trim()}>
              {(serverDialogMode === 'add' ? createServer : updateServer).isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete server dialog ── */}
      <Dialog open={deleteServerOpen} onOpenChange={(open) => { if (!open) setDeleteServerOpen(false) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Server</DialogTitle>
            <DialogDescription>
              This permanently removes <strong>{deleteServerTarget?.name}</strong> and unassigns it from all networks. Cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteServerOpen(false)}>Cancel</Button>
            <Button variant='destructive' onClick={handleDeleteServer} disabled={deleteServer.isPending}>
              {deleteServer.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
