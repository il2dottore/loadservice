export const appConfig = {
  apiUrl: `${(import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '')}/api/v1`,
} as const
