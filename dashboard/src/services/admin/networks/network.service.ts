import { api } from '@/lib/axios'
import { endpoints } from '@/constants/endpoints'
import type { Network, NetworkFeature, NetworkQuery, Server } from './types'

/* ───── Networks ───── */

export async function fetchNetworks(): Promise<Network[]> {
  const { data } = await api.get<Network[]>(endpoints.admin.network.list)
  return data
}

export async function fetchNetworkById(id: number): Promise<NetworkQuery> {
  const { data } = await api.get<NetworkQuery>(
    endpoints.admin.network.byId(id)
  )
  return data
}

export async function createNetwork(data: {
  name: string
}): Promise<Network> {
  const { data: responseData } = await api.post<Network>(
    endpoints.admin.network.create,
    data
  )
  return responseData
}

export async function updateNetwork(
  id: number,
  data: { name?: string }
): Promise<Network> {
  const { data: responseData } = await api.put<Network>(
    endpoints.admin.network.update(id),
    data
  )
  return responseData
}

export async function fetchNetworkFeatures(id: number): Promise<NetworkFeature[]> {
  const { data } = await api.get<NetworkFeature[]>(`${endpoints.admin.network.byId(id)}/features`)
  return data
}
export async function assignFeatureToNetwork(networkId: number, featureId: string) {
  return api.post(`${endpoints.admin.network.byId(networkId)}/features/${featureId}`)
}
export async function removeFeatureFromNetwork(networkId: number, featureId: string) {
  return api.delete(`${endpoints.admin.network.byId(networkId)}/features/${featureId}`)
}

export async function deleteNetwork(id: number): Promise<unknown> {
  const { data } = await api.delete(endpoints.admin.network.delete(id))
  return data
}

/* ───── Network-Server assignments ───── */

export async function assignServerToNetwork(
  networkId: number,
  serverId: number
): Promise<unknown> {
  const { data } = await api.post(
    endpoints.admin.network.servers.create(networkId),
    {
      serverId,
    }
  )
  return data
}

export async function removeServerFromNetwork(
  networkId: number,
  serverId: number
): Promise<unknown> {
  const { data } = await api.delete(
    endpoints.admin.network.servers.delete(networkId, serverId)
  )
  return data
}

/* ───── Servers ───── */

export async function fetchServers(): Promise<Server[]> {
  const { data } = await api.get<Server[]>(endpoints.admin.server.list)
  return data
}

export async function createServer(data: {
  name: string
  address: string
  slots: number
}): Promise<Server> {
  const { data: responseData } = await api.post<Server>(
    endpoints.admin.server.create,
    data
  )
  return responseData
}

export async function updateServer(
  id: number,
  data: { name?: string; address?: string; slots?: number }
): Promise<Server> {
  const { data: responseData } = await api.put<Server>(
    endpoints.admin.server.update(id),
    data
  )
  return responseData
}

export async function deleteServer(id: number): Promise<unknown> {
  const { data } = await api.delete(endpoints.admin.server.delete(id))
  return data
}
