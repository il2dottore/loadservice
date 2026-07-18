import { useMemo, useState } from 'react'
import { DropdownMenuTrigger as RadixDropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { fetchPlans } from '@/services/admin/plans/plan.service'
import {
  cancelPayment,
  fetchPayments,
} from '@/services/payment/payment.service'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'

const paymentStatusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  cancelled: 'bg-slate-200 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300',
}

export function Payments() {
  const [page, setPage] = useState(1)
  const client = useQueryClient()
  const payments = useQuery({ queryKey: ['payments'], queryFn: fetchPayments })
  const plans = useQuery({ queryKey: ['plans', 'list'], queryFn: fetchPlans })
  const cancel = useMutation({
    mutationFn: cancelPayment,
    onSuccess: () => client.invalidateQueries({ queryKey: ['payments'] }),
  })
  const pageSize = 10
  const visiblePayments = useMemo(() => {
    const sorted = [...(payments.data ?? [])].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    return sorted.slice((page - 1) * pageSize, page * pageSize)
  }, [payments.data, page])
  const totalPages = Math.max(
    1,
    Math.ceil((payments.data?.length ?? 0) / pageSize)
  )

  return (
    <>
      <Header fixed />
      <Main className='flex flex-1 flex-col gap-6'>
        <div>
          <h2 className='text-2xl font-bold'>Payments</h2>
          <p className='text-muted-foreground'>Your payment history.</p>
        </div>
        <div className='grid gap-4'>
          {visiblePayments.map((payment) => (
            <Card key={payment.id}>
              <CardHeader className='pb-3'>
                <CardTitle>
                  {plans.data?.find((plan) => plan.id === payment.planId)
                    ?.name ?? `Plan #${payment.planId}`}
                </CardTitle>
                <p className='font-mono text-sm'>{payment.transactionCode}</p>
                <p className='text-sm text-muted-foreground'>
                  Created: {new Date(payment.createdAt).toLocaleString()}
                </p>
                {payment.status === 'pending' && (
                  <p className='text-sm text-muted-foreground'>
                    Expires:{' '}
                    {new Date(
                      new Date(payment.createdAt).getTime() + 15 * 60 * 1000
                    ).toLocaleString()}
                  </p>
                )}
              </CardHeader>
              <CardContent className='flex items-center justify-between pt-0'>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${paymentStatusStyles[payment.status] ?? 'bg-muted text-muted-foreground'}`}
                >
                  {payment.status}
                </span>
                <div className='flex items-center gap-2'>
                  <span className='font-semibold'>
                    {payment.amount.toLocaleString('vi-VN')} VND
                  </span>
                  <DropdownMenu modal={false}>
                    <RadixDropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon'>
                        <MoreHorizontal className='size-4' />
                      </Button>
                    </RadixDropdownMenuTrigger>
                    <DropdownMenuContent
                      align='end'
                      className='z-[100] min-w-32'
                    >
                      <DropdownMenuItem
                        asChild
                        disabled={payment.status !== 'pending'}
                      >
                        <Link
                          to='/payment/$paymentId'
                          params={{ paymentId: payment.id }}
                          search={{ qr: '', amount: payment.amount, code: '' }}
                        >
                          Purchase
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant='destructive'
                        disabled={payment.status !== 'pending'}
                        onClick={() => cancel.mutate(payment.id)}
                      >
                        Cancel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className='flex items-center justify-between'>
          <p className='text-sm text-muted-foreground'>
            Page {page} of {totalPages}
          </p>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              disabled={page === 1}
              onClick={() => setPage((value) => value - 1)}
            >
              Previous
            </Button>
            <Button
              variant='outline'
              disabled={page === totalPages}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Main>
    </>
  )
}
