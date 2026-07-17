import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchPlans } from '@/services/admin/plans/plan.service'
import { fetchAdminUsers } from '@/services/admin/users/user.service'
import { api } from '@/lib/axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function UserPlansManager() {
  const client = useQueryClient()
  const [userId, setUserId] = useState('')
  const users = useQuery({
    queryKey: ['admin', 'users', 'plans'],
    queryFn: () => fetchAdminUsers(100, 1),
  })
  const plans = useQuery({ queryKey: ['plans', 'list'], queryFn: fetchPlans })
  const assigned = useQuery({
    queryKey: ['admin', 'user-plans', userId],
    enabled: !!userId,
    queryFn: async () => (await api.get(`/users/${userId}/plans`)).data,
  })
  const add = useMutation({
    mutationFn: (planId: number) =>
      api.post(`/users/${userId}/plans`, { planId }),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ['admin', 'user-plans', userId] }),
  })
  const remove = useMutation({
    mutationFn: (planId: number) =>
      api.delete(`/users/${userId}/plans/${planId}`),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ['admin', 'user-plans', userId] }),
  })
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage user plans</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger>
            <SelectValue placeholder='Select a user' />
          </SelectTrigger>
          <SelectContent>
            {users.data?.map(({ user }) => (
              <SelectItem key={user.id} value={user.id}>
                {user.username} · {user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {userId && (
          <div className='space-y-2'>
            {assigned.data?.map(
              (item: { planId: number; expirationDate: string }) => (
                <div
                  className='flex items-center justify-between rounded border p-3'
                  key={item.planId}
                >
                  <span>
                    {plans.data?.find((plan) => plan.id === item.planId)
                      ?.name ?? `Plan #${item.planId}`}{' '}
                    · expires {new Date(item.expirationDate).toLocaleString()}
                  </span>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => remove.mutate(item.planId)}
                  >
                    Remove
                  </Button>
                </div>
              )
            )}
            <Select onValueChange={(value) => add.mutate(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder='Add a plan' />
              </SelectTrigger>
              <SelectContent>
                {plans.data?.map((plan) => (
                  <SelectItem key={plan.id} value={String(plan.id)}>
                    {plan.name} · {plan.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
