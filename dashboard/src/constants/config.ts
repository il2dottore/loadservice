const runtimeConfig =
  typeof window !== 'undefined' ? window.__LOADSERVICE_CONFIG__ : undefined

export const appConfig = {
  apiUrl: runtimeConfig?.apiUrl || import.meta.env.VITE_API_URL,
  commonSocketUrl:
    runtimeConfig?.commonSocketUrl || import.meta.env.VITE_COMMON_SOCKET_URL,
  paymentSocketUrl:
    runtimeConfig?.paymentSocketUrl || import.meta.env.VITE_PAYMENT_SOCKET_URL,
  attackSocketUrl:
    runtimeConfig?.attackSocketUrl || import.meta.env.VITE_ATTACK_SOCKET_URL,
} as const
