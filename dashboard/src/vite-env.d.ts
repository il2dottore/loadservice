/// <reference types="vite/client" />

interface Window {
  __LOADSERVICE_CONFIG__?: {
    apiUrl?: string
    commonSocketUrl?: string
    paymentSocketUrl?: string
    attackSocketUrl?: string
  }
}
