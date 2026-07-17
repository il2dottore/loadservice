import { api } from '@/lib/axios'
import { endpoints } from '@/constants/endpoints'

export interface PaymentResponse {
  createdAt: string | number | Date
  id: string
  amount: number
  planId: number
  transactionCode: string
  status: string
  qrCodeUrl: string
}

export async function createPayment(planId: number, amount: number) {
  const { data } = await api.post<PaymentResponse>(endpoints.payment.create, {
    planId,
    amount,
  })
  return data
}

export async function fetchPayments() {
  const { data } = await api.get<PaymentResponse[]>(endpoints.payment.list)
  return data
}

export async function cancelPayment(id: string) {
  const { data } = await api.delete<PaymentResponse>(endpoints.payment.byId(id))
  return data
}
