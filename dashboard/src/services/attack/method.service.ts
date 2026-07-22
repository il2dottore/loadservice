import { api } from '@/lib/axios'

type AttackMethod = {
  id: number
  name: string
  osiLayer: 'LAYER_4' | 'LAYER_7'
  features: { id: string }[]
}

export async function fetchAttackMethods(): Promise<AttackMethod[]> {
  const { data } = await api.get<AttackMethod[]>('/methods')
  return data
}
