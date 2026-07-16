import { api } from '@/lib/axios'
import { endpoints } from '@/constants/endpoints'

export type AdminMethod = {
  id: number
  name: string
  osiLayer: 'LAYER_4' | 'LAYER_7'
  features: { id: string; name: string }[]
}

export async function fetchMethods() {
  const { data } = await api.get<AdminMethod[]>(endpoints.admin.method.list)
  return data
}
export async function createMethod(data: { name: string; osiLayer: AdminMethod['osiLayer'] }) {
  const { data: result } = await api.post<AdminMethod>(endpoints.admin.method.create, data)
  return result
}
export async function updateMethod(id: number, data: Partial<{ name: string; osiLayer: AdminMethod['osiLayer'] }>) {
  const { data: result } = await api.put<AdminMethod>(endpoints.admin.method.update(id), data)
  return result
}
export async function deleteMethod(id: number) { return api.delete(endpoints.admin.method.delete(id)) }
export async function assignFeature(methodId: number, featureId: string) {
  return api.post(endpoints.admin.method.features.create(methodId, featureId))
}
export async function removeFeature(methodId: number, featureId: string) {
  return api.delete(endpoints.admin.method.features.delete(methodId, featureId))
}
