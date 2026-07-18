import { api } from '@/lib/axios'

export type CreateAttackInput = {
  target: string
  duration: number
  methodId?: number
  userId?: string
  port?: number
  ppsLimit?: number
  rateLimit?: number
  requestMethod?: string
  postData?: string
}

export type AttackStatus =
  | 'QUEUED'
  | 'SCHEDULED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'TIMEOUT'

export type Attack = CreateAttackInput & {
  id: number
  status: AttackStatus
  createdAt: string
  startedAt?: string | null
  failureReason?: string | null
  serverId?: number | null
}

export type AttackStatistics = {
  totalBenchmarks: number
  totalBenchmarksRunning: number
  totalServers: number
  totalServersOnline: number
  overview: { date: string; attacks: number }[]
}

export async function fetchAttackStatistics(): Promise<AttackStatistics> {
  const { data } = await api.get<AttackStatistics>('/attacks/statistics')
  return data
}

export async function fetchAttacks(): Promise<Attack[]> {
  const { data } = await api.get<Attack[]>('/attacks')
  return data
}

export async function sendAttack(input: CreateAttackInput): Promise<Attack> {
  const { data } = await api.post('/attacks', input)
  return data
}

export async function stopAttack(id: number): Promise<Attack> {
  const { data } = await api.put<Attack>(`/attacks/${id}`, {
    status: 'CANCELLED',
  })
  return data
}

export async function clearAttackHistory(): Promise<void> {
  await api.delete('/attacks/history')
}
