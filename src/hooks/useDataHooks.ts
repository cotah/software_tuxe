'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orders, alerts, timeline, insights, dashboard, customers, analytics, appointments, calendarConnections } from '@/lib/api'
import { AnalyticsRange, Appointment, CalendarProvider } from '@/types'

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

export function useSearchOrders(query: string) {
  return useQuery({
    queryKey: ['orders', 'search', query],
    queryFn: () => orders.search(query),
    enabled: true,
  })
}

export function useNotifyOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: string) => orders.notify(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
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

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: customers.list,
  })
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => customers.getById(id),
    enabled: !!id,
  })
}

export function useCustomerOrders(customerId: string) {
  return useQuery({
    queryKey: ['customers', customerId, 'orders'],
    queryFn: () => customers.ordersByCustomer(customerId),
    enabled: !!customerId,
  })
}

export function useAnalyticsSummary(
  range: AnalyticsRange,
  status?: string,
  channel?: string
) {
  return useQuery({
    queryKey: ['analytics', 'summary', range, status, channel],
    queryFn: () => analytics.getSummary({ range, status, channel }),
  })
}

export function useAppointments(date: string) {
  return useQuery({
    queryKey: ['appointments', date],
    queryFn: () => appointments.list({ date }),
    enabled: !!date,
  })
}

export function useCreateAppointment(currentDate: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: Omit<Appointment, 'id'>) => appointments.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', currentDate] })
    },
  })
}

export function useCalendarConnection() {
  return useQuery({
    queryKey: ['calendarConnection'],
    queryFn: calendarConnections.get,
  })
}

export function useConnectCalendar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (provider: CalendarProvider) => calendarConnections.connect(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarConnection'] })
    },
  })
}

export function useDisconnectCalendar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => calendarConnections.disconnect(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarConnection'] })
    },
  })
}

export function useSyncCalendar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => calendarConnections.sync(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarConnection'] })
    },
  })
}
