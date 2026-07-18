export const appConfig = {
  apiUrl: import.meta.env.VITE_API_URL,
  commonSocketUrl: import.meta.env.VITE_COMMON_SOCKET_URL,
  paymentSocketUrl: import.meta.env.VITE_PAYMENT_SOCKET_URL,
  attackSocketUrl: import.meta.env.VITE_ATTACK_SOCKET_URL,
} as const
