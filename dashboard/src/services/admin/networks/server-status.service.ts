import { api } from '@/lib/axios'
import { endpoints } from '@/constants/endpoints'

type ServerStatus = {
  id: number
  online: boolean
  cpu: number
  memory: number
  active: number
  maxSlots: number
}

export async function fetchServerStatuses(): Promise<ServerStatus[]> {
  const { data } = await api.get<ServerStatus[]>(endpoints.admin.server.status)
  return data
}
