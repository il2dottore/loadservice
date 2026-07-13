import { api } from '@/lib/axios'
import { endpoints } from '@/constants/endpoints'
import type { Feature, Plan, PlanQueryRow } from './types'

/* ───── Plans ───── */

export async function fetchPlans(): Promise<Plan[]> {
  const { data } = await api.get<Plan[]>(endpoints.admin.plan.list)
  return data
}

export async function fetchPlanById(id: number): Promise<PlanQueryRow[]> {
  const { data } = await api.get<PlanQueryRow[]>(endpoints.admin.plan.byId(id))
  return data
}

export async function createPlan(data: {
  name: string
  price: number
  maxDuration: number
  maxConcurrents: number
  isCustom: boolean
}): Promise<Plan> {
  const response = await api.post<Plan>(endpoints.admin.plan.create, data)
  return response.data
}

export async function updatePlan(
  id: number,
  data: {
    name?: string
    price?: number
    maxDuration?: number
    maxConcurrents?: number
    isCustom?: boolean
  }
): Promise<Plan> {
  const response = await api.put<Plan>(endpoints.admin.plan.byId(id), data)
  return response.data
}

export async function deletePlan(id: number): Promise<unknown> {
  const { data } = await api.delete(endpoints.admin.plan.byId(id))
  return data
}

/* ───── Plan-Feature assignments ───── */

export async function assignFeatureToPlan(
  planId: number,
  featureId: string
): Promise<unknown> {
  const { data } = await api.post(endpoints.admin.plan.features(planId), {
    featureId,
  })
  return data
}

export async function removeFeatureFromPlan(
  planId: number,
  featureId: string
): Promise<unknown> {
  const { data } = await api.delete(
    endpoints.admin.plan.feature(planId, featureId)
  )
  return data
}

/* ───── Features ───── */

export async function fetchFeatures(): Promise<Feature[]> {
  const { data } = await api.get<Feature[]>(endpoints.admin.feature.list)
  return data
}

export async function createFeature(
  id: string,
  name: string
): Promise<Feature> {
  const { data } = await api.post<Feature>(endpoints.admin.feature.create, {
    id,
    name,
  })
  return data
}

export async function updateFeature(
  id: string,
  data: { id?: string; name?: string }
): Promise<Feature> {
  const response = await api.put<Feature>(
    endpoints.admin.feature.byId(id),
    data
  )
  return response.data
}

export async function deleteFeature(id: string): Promise<unknown> {
  const { data } = await api.delete(endpoints.admin.feature.byId(id))
  return data
}
