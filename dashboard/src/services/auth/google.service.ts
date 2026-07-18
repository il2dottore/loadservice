import { api } from '@/lib/axios'

export async function getGoogleConnectUrl() {
  return (await api.get<{ url: string }>('/auth/google/url')).data.url
}

export async function disconnectGoogle() {
  await api.delete('/auth/google')
}
