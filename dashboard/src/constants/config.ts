const apiOrigin =
  import.meta.env.VITE_API_URL ??
  `${window.location.protocol}//${window.location.hostname}:8080/api/v1`

export const appConfig = {
  apiUrl: apiOrigin,
  socketUrl:
    import.meta.env.VITE_ATTACK_SOCKET_URL ??
    `${window.location.protocol}//${window.location.hostname}:4000`,
} as const
