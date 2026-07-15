const apiOrigin =
  import.meta.env.VITE_API_URL ??
  `${window.location.protocol}//${window.location.hostname}:8080`

export const appConfig = {
  apiUrl: `${apiOrigin.replace(/\/$/, '')}/api/v1`,
} as const
