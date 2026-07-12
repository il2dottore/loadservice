import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth-store'

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000' })

let refreshRequest: Promise<string> | null = null

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState().auth
  if (accessToken && config.url !== '/auth/refresh') {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined
    if (error.response?.status !== 401 || !request || request._retried || request.url === '/auth/refresh') {
      return Promise.reject(error)
    }

    request._retried = true
    const auth = useAuthStore.getState().auth
    if (!auth.refreshToken) {
      auth.reset()
      return Promise.reject(error)
    }

    try {
      refreshRequest ??= api
        .post<{ accessToken: string }>('/auth/refresh', { refreshToken: auth.refreshToken })
        .then(({ data }) => data.accessToken)
        .finally(() => { refreshRequest = null })
      const accessToken = await refreshRequest
      auth.setAccessToken(accessToken)
      request.headers.Authorization = `Bearer ${accessToken}`
      return api(request)
    } catch (refreshError) {
      auth.reset()
      return Promise.reject(refreshError)
    }
  },
)
