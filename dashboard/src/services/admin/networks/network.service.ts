import { api } from '@/lib/axios'
import type { Network, NetworkQueryRow, Server } from './types'

/* ───── Networks ───── */

export function fetchNetworks() {
  return api.get<Network[]>('/admin/networks').then((r) => r.data)
}

export function fetchNetworkById(id: number) {
  return api.get<NetworkQueryRow[]>(`/admin/networks/${id}`).then((r) => r.data)
}

export function createNetwork(data: { name: string; vipAccess: boolean }) {
  return api.post<Network>('/admin/networks/create', data).then((r) => r.data)
}

export function updateNetwork(id: number, data: { name?: string; vipAccess?: boolean }) {
  return api.put<Network>(`/admin/networks/${id}`, data).then((r) => r.data)
}

export function deleteNetwork(id: number) {
  return api.delete(`/admin/networks/${id}`).then((r) => r.data)
}

/* ───── Network-Server assignments ───── */

export function assignServerToNetwork(networkId: number, serverId: number) {
  return api.post(`/admin/networks/${networkId}/servers`, { serverId }).then((r) => r.data)
}

export function removeServerFromNetwork(networkId: number, serverId: number) {
  return api.delete(`/admin/networks/${networkId}/servers/${serverId}`).then((r) => r.data)
}

/* ───── Servers ───── */

export function fetchServers() {
  return api.get<Server[]>('/admin/servers').then((r) => r.data)
}

export function createServer(data: { name: string; address: string }) {
  return api.post<Server>('/admin/servers/create', data).then((r) => r.data)
}

export function updateServer(id: number, data: { name?: string; address?: string }) {
  return api.put<Server>(`/admin/servers/${id}`, data).then((r) => r.data)
}

export function deleteServer(id: number) {
  return api.delete(`/admin/servers/${id}`).then((r) => r.data)
}
