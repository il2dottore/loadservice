export interface Network {
  id: number
  name: string
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

export interface NetworkQuery {
  network: Network
  servers: Server[]
}


export interface NetworkFeature { networkId: number; featureId: string }
