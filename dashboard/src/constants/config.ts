const apiOrigin =
  import.meta.env.VITE_API_URL ??
  `${window.location.protocol}//${window.location.hostname}:8080/api/v1`

export const appConfig = {
  apiUrl: apiOrigin,
  paymentSocketUrl:
    import.meta.env.VITE_PAYMENT_SOCKET_URL ??
    `${window.location.protocol}//${window.location.hostname}:5000`,
  attackSocketUrl:
    import.meta.env.VITE_ATTACK_SOCKET_URL ??
    `${window.location.protocol}//${window.location.hostname}:4000`,
} as const
