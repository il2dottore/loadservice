export const appConfig = {
  apiUrl: `${(import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')}/api/v1`,
} as const
