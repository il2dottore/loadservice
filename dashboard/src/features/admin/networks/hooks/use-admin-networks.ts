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
  fetchNetworkFeatures,
  assignFeatureToNetwork,
  removeFeatureFromNetwork,
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
      return data
    },
  })
}

export function useCreateNetwork() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string }) =>
      createNetwork(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: networksKey }),
  })
}

export function useUpdateNetwork() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: { name?: string }
    }) => updateNetwork(id, data),
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
    mutationFn: ({
      networkId,
      serverId,
    }: {
      networkId: number
      serverId: number
    }) => assignServerToNetwork(networkId, serverId),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: [...networksKey, 'detail', vars.networkId],
      }),
  })
}

export function useRemoveServer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      networkId,
      serverId,
    }: {
      networkId: number
      serverId: number
    }) => removeServerFromNetwork(networkId, serverId),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: [...networksKey, 'detail', vars.networkId],
      }),
  })
}

export function useNetworkFeatures(id: number | null) {
  return useQuery({ queryKey: [...networksKey, 'features', id], queryFn: () => fetchNetworkFeatures(id!), enabled: id !== null })
}
export function useAssignNetworkFeature() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ networkId, featureId }: { networkId: number; featureId: string }) => assignFeatureToNetwork(networkId, featureId), onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: [...networksKey, 'features', v.networkId] }) })
}
export function useRemoveNetworkFeature() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ networkId, featureId }: { networkId: number; featureId: string }) => removeFeatureFromNetwork(networkId, featureId), onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: [...networksKey, 'features', v.networkId] }) })
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
    mutationFn: (data: { name: string; address: string; slots: number }) =>
      createServer(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: serversKey }),
  })
}

export function useUpdateServer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: { name?: string; address?: string; slots?: number }
    }) => updateServer(id, data),
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
