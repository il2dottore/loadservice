import { api } from '@/lib/axios'
import type { Feature, Plan, PlanQueryRow } from './types'

/* ───── Plans ───── */

export function fetchPlans() {
  return api.get<Plan[]>('/admin/plans').then((r) => r.data)
}

export function fetchPlanById(id: number) {
  return api.get<PlanQueryRow[]>(`/admin/plans/${id}`).then((r) => r.data)
}

export function createPlan(data: { name: string; price: number; maxDuration: number; maxConcurrents: number; isCustom: boolean }) {
  return api.post<Plan>('/admin/plans/create', data).then((r) => r.data)
}

export function updatePlan(id: number, data: { name?: string; price?: number; maxDuration?: number; maxConcurrents?: number; isCustom?: boolean }) {
  return api.put<Plan>(`/admin/plans/${id}`, data).then((r) => r.data)
}

export function deletePlan(id: number) {
  return api.delete(`/admin/plans/${id}`).then((r) => r.data)
}

/* ───── Plan-Feature assignments ───── */

export function assignFeatureToPlan(planId: number, featureId: string) {
  return api.post(`/admin/plans/${planId}/features`, { featureId }).then((r) => r.data)
}

export function removeFeatureFromPlan(planId: number, featureId: string) {
  return api.delete(`/admin/plans/${planId}/features/${featureId}`).then((r) => r.data)
}

/* ───── Features ───── */

export function fetchFeatures() {
  return api.get<Feature[]>('/admin/features').then((r) => r.data)
}

export function createFeature(id: string, name: string) {
  return api.post<Feature>('/admin/features/create', { id, name }).then((r) => r.data)
}

export function updateFeature(id: string, data: { id?: string; name?: string }) {
  return api.put<Feature>(`/admin/features/${id}`, data).then((r) => r.data)
}

export function deleteFeature(id: string) {
  return api.delete(`/admin/features/${id}`).then((r) => r.data)
}
