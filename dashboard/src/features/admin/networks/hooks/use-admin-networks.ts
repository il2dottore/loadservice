import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  assignServerToNetwork,
  createNetwork,
  createServer,
  deleteNetwork,
  deleteServer,
  fetchNetworkById,
  fetchNetworks,
  fetchServers,
  removeServerFromNetwork,
  updateNetwork,
  updateServer,
} from '@/services/admin/networks/network.service'

/* ───── Networks ───── */

const networksKey = ['admin', 'networks'] as const

export function useNetworks() {
  return useQuery({
    queryKey: [...networksKey, 'list'],
    queryFn: fetchNetworks,
  })
}

export function useNetworkById(id: number | null) {
  return useQuery({
    queryKey: [...networksKey, 'detail', id],
    queryFn: () => fetchNetworkById(id!),
    enabled: id !== null,
    select: (data) => {
      const svrs = data
        .map((row) => row.servers)
        .filter((s): s is NonNullable<typeof s> => s !== null)
      return {
        network: data[0]?.networks ?? null,
        servers: [...new Map(svrs.map((s) => [s.id, s])).values()],
      }
    },
  })
}

export function useCreateNetwork() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; vipAccess: boolean }) => createNetwork(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: networksKey }),
  })
}

export function useUpdateNetwork() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; vipAccess?: boolean } }) =>
      updateNetwork(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: networksKey }),
  })
}

export function useDeleteNetwork() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteNetwork(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: networksKey }),
  })
}

/* ───── Network-Server assignments ───── */

export function useAssignServer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ networkId, serverId }: { networkId: number; serverId: number }) =>
      assignServerToNetwork(networkId, serverId),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: [...networksKey, 'detail', vars.networkId] }),
  })
}

export function useRemoveServer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ networkId, serverId }: { networkId: number; serverId: number }) =>
      removeServerFromNetwork(networkId, serverId),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: [...networksKey, 'detail', vars.networkId] }),
  })
}

/* ───── Servers ───── */

const serversKey = ['admin', 'servers'] as const

export function useServers() {
  return useQuery({
    queryKey: [...serversKey, 'list'],
    queryFn: fetchServers,
  })
}

export function useCreateServer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; address: string }) => createServer(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: serversKey }),
  })
}

export function useUpdateServer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; address?: string } }) =>
      updateServer(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: serversKey }),
  })
}

export function useDeleteServer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteServer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: serversKey }),
  })
}
