import { useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  KeyRound,
  Laptop,
  Loader2,
  LogOut,
  MoreHorizontal,
  Plus,
  Shield,
  Smartphone,
  Tablet,
  Trash2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuthStore } from '@/store/auth.store'
import { useApiKeys, useSessions, useRevokeSession, useRevokeAllSessions } from './hooks'
import { decodeToken, maskKey } from '@/services/security/security.service'
import type { ApiKey } from '@/services/security/types'

function deviceIcon(kind: string) {
  if (kind === 'mobile') return Smartphone
  if (kind === 'tablet') return Tablet
  return Laptop
}

function formatLastActive(iso: string): string {
  if (!iso) return 'Unknown'
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true })
  } catch {
    return iso
  }
}

export function SecurityPanel() {
  const { auth } = useAuthStore()
  const tokenData = decodeToken(auth.accessToken)
  const userId = tokenData?.sub ?? ''
  const currentSessionId = tokenData?.sessionId ?? ''

  const { keys: apiKeys, create: createKey, rename: renameKey, remove: removeKey } = useApiKeys()
  const { data: sessions, isLoading } = useSessions(auth.accessToken, userId)
  const revokeSession = useRevokeSession(auth.accessToken, userId)
  const revokeAllSessions = useRevokeAllSessions(auth.accessToken, userId)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingKeyId, setEditingKeyId] = useState<string | null>(null)
  const [apiKeyName, setApiKeyName] = useState('')
  const [deletingKeyId, setDeletingKeyId] = useState<string | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null)
  const [revokeAllOpen, setRevokeAllOpen] = useState(false)

  const editingKey = useMemo(
    () => apiKeys.find((key) => key.id === editingKeyId) ?? null,
    [apiKeys, editingKeyId],
  )

  const activeSessions = sessions ?? []

  function openCreateDialog() {
    setEditingKeyId(null)
    setApiKeyName('')
    setDialogOpen(true)
  }

  function openEditDialog(key: ApiKey) {
    setEditingKeyId(key.id)
    setApiKeyName(key.name)
    setDialogOpen(true)
  }

  function saveApiKey() {
    const name = apiKeyName.trim()
    if (!name) return
    if (editingKey) renameKey(editingKey.id, name)
    else createKey(name)
    setDialogOpen(false)
  }

  function deleteApiKey(id: string) {
    removeKey(id)
    setDeletingKeyId(null)
  }

  return (
    <div className='min-w-0 max-w-full space-y-6'>
      <Card className='max-w-full gap-0 overflow-hidden'>
        <CardHeader className='border-b bg-muted/30 max-sm:grid-cols-1 max-sm:gap-4'>
          <div className='flex min-w-0 items-start gap-3'>
            <div className='flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
              <KeyRound className='size-5' />
            </div>
            <div className='min-w-0 space-y-1'>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Create, rename, and remove keys used by your internal tools and automations.
              </CardDescription>
            </div>
          </div>
          <CardAction className='max-sm:col-auto max-sm:row-auto max-sm:justify-self-start'>
            <Button onClick={openCreateDialog}>
              <Plus />
              New key
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className='grid gap-4 px-4 pt-6 md:hidden'>
          {apiKeys.map((key) => (
            <div key={key.id} className='rounded-xl border p-4'>
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0 space-y-1'>
                  <p className='font-medium'>{key.name}</p>
                  <p className='font-mono text-xs break-all text-muted-foreground'>
                    {maskKey(key.prefix)}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon' aria-label='Key actions'>
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick={() => openEditDialog(key)}>Rename key</DropdownMenuItem>
                    <DropdownMenuItem variant='destructive' onClick={() => setDeletingKeyId(key.id)}>
                      Delete key
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className='mt-4 space-y-3 text-sm'>
                <div>
                  <p className='text-muted-foreground'>Scopes</p>
                  <div className='mt-2 flex flex-wrap gap-1.5'>
                    {key.scopes.map((scope) => (
                      <Badge key={scope} variant='outline'>
                        {scope}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <p className='text-muted-foreground'>Last used</p>
                    <p className='mt-1 font-medium'>{key.lastUsed}</p>
                  </div>
                  <div>
                    <p className='text-muted-foreground'>Created</p>
                    <p className='mt-1 font-medium'>{key.createdAt}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
        <CardContent className='hidden px-0 md:block'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='ps-6'>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Scopes</TableHead>
                <TableHead>Last used</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className='pe-6 text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className='ps-6 font-medium'>{key.name}</TableCell>
                  <TableCell className='font-mono text-xs text-muted-foreground'>
                    {maskKey(key.prefix)}
                  </TableCell>
                  <TableCell>
                    <div className='flex flex-wrap gap-1.5'>
                      {key.scopes.map((scope) => (
                        <Badge key={scope} variant='outline'>
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{key.lastUsed}</TableCell>
                  <TableCell>{key.createdAt}</TableCell>
                  <TableCell className='pe-6 text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon' aria-label='Key actions'>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => openEditDialog(key)}>Rename key</DropdownMenuItem>
                        <DropdownMenuItem variant='destructive' onClick={() => setDeletingKeyId(key.id)}>
                          Delete key
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className='max-w-full gap-0 overflow-hidden'>
        <CardHeader className='border-b bg-muted/30 max-sm:grid-cols-1 max-sm:gap-4'>
          <div className='flex min-w-0 items-start gap-3'>
            <div className='flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
              <Shield className='size-5' />
            </div>
            <div className='min-w-0 space-y-1'>
              <CardTitle>Signed-in Devices</CardTitle>
              <CardDescription>
                Review where your account is active and revoke sessions you no longer recognize.
              </CardDescription>
            </div>
          </div>
          <CardAction className='flex flex-wrap items-center gap-2 max-sm:col-auto max-sm:row-auto max-sm:justify-self-start'>
            {sessions && sessions.length > 0 && (
              <Button variant='outline' size='sm' onClick={() => setRevokeAllOpen(true)} disabled={revokeAllSessions.isPending}>
                <LogOut />
                Revoke all
              </Button>
            )}
            <Badge variant='secondary'>{isLoading ? '...' : `${activeSessions.length} active now`}</Badge>
          </CardAction>
        </CardHeader>
        <CardContent className='grid gap-4 pt-6'>
          {isLoading ? (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='size-6 animate-spin text-muted-foreground' />
            </div>
          ) : sessions && sessions.length > 0 ? (
            sessions.map((device) => {
              const isCurrent = device.sessionId === currentSessionId
              const Icon = deviceIcon(device.deviceKind)
              const lastActive = formatLastActive(device.lastActive)
              return (
                <div key={device.sessionId} className='flex min-w-0 flex-col gap-4 rounded-xl border p-4 md:flex-row md:items-center md:justify-between'>
                  <div className='flex min-w-0 items-start gap-4'>
                    <div className='flex size-11 items-center justify-center rounded-xl bg-muted'>
                      <Icon className='size-5 text-muted-foreground' />
                    </div>
                    <div className='min-w-0 space-y-2'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <p className='break-words font-medium'>{device.deviceName}</p>
                        {isCurrent ? <Badge>Current session</Badge> : <Badge variant='secondary'>Active</Badge>}
                      </div>
                      <div className='grid gap-1 text-sm text-muted-foreground'>
                        {device.ipAddress && <p>IP: {device.ipAddress}</p>}
                        <p>
                          {device.createdAt ? `Signed in ${formatLastActive(device.createdAt)}` : 'Session active'}
                          {lastActive !== 'Unknown' && !isCurrent && <> &middot; Last activity {lastActive}</>}
                          {isCurrent && <> &middot; Active now</>}
                        </p>
                      </div>
                    </div>
                  </div>
                  {!isCurrent && (
                    <div className='flex items-center gap-2 self-end md:self-auto'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-destructive hover:text-destructive'
                        onClick={() => setRevokeTarget(device.sessionId)}
                        disabled={revokeSession.isPending && revokeTarget === device.sessionId}
                      >
                        <Trash2 />
                        Revoke
                      </Button>
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className='rounded-xl border border-dashed p-8 text-center'>
              <div className='mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-muted'>
                <Laptop className='size-5 text-muted-foreground' />
              </div>
              <p className='font-medium'>No active devices</p>
              <p className='text-sm text-muted-foreground'>New sessions will appear here after your next sign-in.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revoke single session dialog */}
      <Dialog open={!!revokeTarget} onOpenChange={(open) => { if (!open) setRevokeTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke session</DialogTitle>
            <DialogDescription>
              This will sign the device out immediately. The user will need to sign in again to regain access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setRevokeTarget(null)}>Cancel</Button>
            <Button
              variant='destructive'
              disabled={revokeSession.isPending}
              onClick={() => { if (revokeTarget) revokeSession.mutate(revokeTarget, { onSuccess: () => setRevokeTarget(null) }) }}
            >
              {revokeSession.isPending ? 'Revoking...' : 'Revoke'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke all sessions dialog */}
      <Dialog open={revokeAllOpen} onOpenChange={setRevokeAllOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke all sessions</DialogTitle>
            <DialogDescription>
              This will sign out all devices except your current session. You will stay signed in on this device.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setRevokeAllOpen(false)}>Cancel</Button>
            <Button
              variant='destructive'
              disabled={revokeAllSessions.isPending}
              onClick={() => revokeAllSessions.mutate(undefined, { onSuccess: () => setRevokeAllOpen(false) })}
            >
              {revokeAllSessions.isPending ? 'Revoking...' : 'Revoke all'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API key dialogs */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingKey ? 'Rename API key' : 'Create API key'}</DialogTitle>
            <DialogDescription>
              {editingKey ? 'Update the label used to identify this key in your workspace.' : 'This is a mock flow for creating a new API key.'}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-2'>
            <label htmlFor='api-key-name' className='text-sm font-medium'>Key name</label>
            <Input id='api-key-name' value={apiKeyName} onChange={(event) => setApiKeyName(event.target.value)} placeholder='Mobile app integration' />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveApiKey}>{editingKey ? 'Save changes' : 'Create key'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingKeyId} onOpenChange={(open) => { if (!open) setDeletingKeyId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete API key</DialogTitle>
            <DialogDescription>This mock action removes the key from the local list immediately.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeletingKeyId(null)}>Cancel</Button>
            <Button variant='destructive' onClick={() => deletingKeyId && deleteApiKey(deletingKeyId)}>Delete key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
