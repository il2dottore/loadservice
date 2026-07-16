import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/auth.store'
import { toast } from 'sonner'
import { appConfig } from '@/constants/config'

export const api = axios.create({ baseURL: appConfig.apiUrl })

api.interceptors.response.use((response) => {
  const body = response.data
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    if (
      response.config.method?.toUpperCase() !== 'GET' &&
      typeof body.message === 'string' &&
      body.message.length > 0
    ) {
      toast.success(body.message)
    }
    response.data = body.data
  }
  return response
})

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
    const request = error.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined
    if (
      error.response?.status !== 401 ||
      !request ||
      request._retried ||
      request.url === '/auth/refresh'
    ) {
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
        .post<{ accessToken: string; refreshToken?: string }>('/auth/refresh', {
          refreshToken: auth.refreshToken,
        })
        .then(({ data }) => {
          auth.setRefreshToken(data.refreshToken ?? auth.refreshToken)
          return data.accessToken
        })
        .finally(() => {
          refreshRequest = null
        })
      const accessToken = await refreshRequest
      auth.setAccessToken(accessToken)
      request.headers.Authorization = `Bearer ${accessToken}`
      return api(request)
    } catch (refreshError) {
      auth.reset()
      return Promise.reject(refreshError)
    }
  }
)
