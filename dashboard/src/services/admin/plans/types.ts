export interface Plan {
  id: number
  name: string
  price: number
  maxDuration: number
  maxConcurrents: number
  isCustom: boolean
  createdAt: string
  updatedAt: string
}

export interface Feature {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface PlanQueryRow {
  plans: Plan
  plans_features: { planId: number; featureId: string } | null
  features: Feature | null
}
