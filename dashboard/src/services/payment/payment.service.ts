import { api } from '@/lib/axios'
import { endpoints } from '@/constants/endpoints'

export interface PaymentResponse {
  id: string
  amount: number
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
