const apiOrigin =
  import.meta.env.VITE_API_URL ??
  `${window.location.protocol}//${window.location.hostname}:8080`

export const appConfig = {
  apiUrl: `${apiOrigin.replace(/\/$/, '')}/api/v1`,
  socketUrl:
    import.meta.env.VITE_ATTACK_SOCKET_URL ??
    `${window.location.protocol}//${window.location.hostname}:4000`,
} as const
