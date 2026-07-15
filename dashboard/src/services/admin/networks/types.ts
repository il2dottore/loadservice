export interface Network {
  id: number
  name: string
  vipAccess: boolean
  createdAt: string
  updatedAt: string
}

export interface Server {
  id: number
  name: string
  address: string
  slots: number
  createdAt: string
  updatedAt: string
}

export interface NetworkQueryRow {
  networks: Network
  networks_servers: { networkId: number; serverId: number } | null
  servers: Server | null
}
