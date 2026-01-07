'use client'

import { useQuery } from '@tanstack/react-query'
import { orders, alerts, timeline, insights, dashboard } from '@/lib/api'

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: orders.list,
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => orders.getById(id),
    enabled: !!id,
  })
}

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: alerts.list,
  })
}

export function useTimelineEvents() {
  return useQuery({
    queryKey: ['timeline'],
    queryFn: timeline.list,
  })
}

export function useInsights() {
  return useQuery({
    queryKey: ['insights'],
    queryFn: insights.list,
  })
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboard.getSummary,
  })
}
