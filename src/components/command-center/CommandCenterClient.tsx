'use client'

import { useOrders, useAlerts, useTimelineEvents, useInsights, useDashboardSummary } from '@/hooks/useDataHooks'
import { GreetingSummary } from './GreetingSummary'
import { DayTimeline } from './DayTimeline'
import { WorkshopNowCards } from './WorkshopNowCards'
import { AttentionPanel } from './AttentionPanel'
import { NextDeliveriesList } from './NextDeliveriesList'
import { InsightCard } from './InsightCard'

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded w-64" />
        <div className="h-6 bg-muted rounded w-96" />
      </div>
      <div className="h-24 bg-muted rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-64 bg-muted rounded" />
        <div className="h-64 bg-muted rounded" />
      </div>
    </div>
  )
}

export function CommandCenterClient() {
  const { data: orders, isLoading: ordersLoading } = useOrders()
  const { data: alerts, isLoading: alertsLoading } = useAlerts()
  const { data: timeline, isLoading: timelineLoading } = useTimelineEvents()
  const { data: insights, isLoading: insightsLoading } = useInsights()
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary()

  const isLoading = ordersLoading || alertsLoading || timelineLoading || insightsLoading || summaryLoading

  if (isLoading) {
    return <LoadingSkeleton />
  }

  const safeOrders = orders ?? []
  const safeAlerts = alerts ?? []
  const safeTimeline = timeline ?? []
  const safeInsights = insights ?? []

  const inProgressCount = safeOrders.filter((o) => o.status === 'in_progress').length
  const waitingCount = safeOrders.filter((o) => o.status === 'waiting').length
  const readyCount = safeOrders.filter((o) => o.status === 'ready').length
  const readyTotal = safeOrders
    .filter((o) => o.status === 'ready')
    .reduce((acc, o) => acc + o.total, 0)

  const deliveryCount = safeTimeline.filter((e) => e.type === 'delivery').length
  const criticalCount = safeAlerts.filter((a) => a.severity === 'critical').length

  return (
    <div className="space-y-12">
      {/* ZONA 1: Saudação */}
      <GreetingSummary
        userName={summary?.userName ?? 'Usuário'}
        orderCount={safeOrders.length}
        deliveryCount={deliveryCount}
        awaitingResponseCount={safeAlerts.filter((a) => a.message.includes('sem resposta')).length}
        hasCritical={criticalCount > 0}
        criticalCount={criticalCount}
      />

      {/* ZONA 2: Timeline */}
      <DayTimeline events={safeTimeline} />

      {/* ZONA 3: Grid com 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <WorkshopNowCards
          stats={{
            inProgress: inProgressCount,
            waiting: waitingCount,
            ready: readyCount,
            readyTotal: readyTotal,
          }}
        />
        <AttentionPanel alerts={safeAlerts} />
      </div>

      {/* ZONA 4: Próximas entregas */}
      <NextDeliveriesList orders={safeOrders} />

      {/* ZONA 5: Insights */}
      <InsightCard insights={safeInsights} />
    </div>
  )
}
