'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { getGreeting, formatCurrency } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { WorkshopStatus } from '@/components/blocks/stat-card'
import { AlertPanel } from '@/components/blocks/alert-panel'
import { DayTimeline } from '@/components/blocks/day-timeline'
import { UpcomingDeliveries } from '@/components/blocks/upcoming-deliveries'
import { AiSuggestionCard, AiInsight } from '@/components/blocks/ai-suggestion'

export default function CommandCenterPage() {
  const router = useRouter()
  const greeting = getGreeting()

  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const res = await api.dashboard.getStats()
      return res.data
    },
  })

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['dashboard', 'alerts'],
    queryFn: async () => {
      const res = await api.dashboard.getAlerts()
      return res.data
    },
  })

  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: ['dashboard', 'timeline'],
    queryFn: async () => {
      const res = await api.dashboard.getTimeline()
      return res.data
    },
  })

  const { data: deliveries, isLoading: deliveriesLoading } = useQuery({
    queryKey: ['dashboard', 'deliveries'],
    queryFn: async () => {
      const res = await api.dashboard.getUpcomingDeliveries()
      return res.data
    },
  })

  // Generate summary sentence
  const summaryText = stats
    ? `Hoje você tem ${stats.readyForDelivery} bike${stats.readyForDelivery !== 1 ? 's' : ''} para entregar e ${stats.inProgress + stats.waiting} em andamento.`
    : ''

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8 animate-fade-in">
      {/* Header with greeting */}
      <div className="mb-8">
        <h1 className="text-display text-text-primary">{greeting}, Carlos.</h1>
        {statsLoading ? (
          <Skeleton className="h-6 w-80 mt-2" />
        ) : (
          <p className="text-lg text-text-secondary mt-1">{summaryText}</p>
        )}
      </div>

      {/* Day Timeline */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Seu dia</CardTitle>
        </CardHeader>
        <CardContent>
          {timelineLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : timeline ? (
            <DayTimeline events={timeline} />
          ) : null}
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Workshop Status */}
          <div>
            <h2 className="text-sm font-medium text-text-secondary mb-3 uppercase tracking-wide">
              Oficina Agora
            </h2>
            {statsLoading ? (
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
              </div>
            ) : stats ? (
              <WorkshopStatus
                inProgress={stats.inProgress}
                waiting={stats.waiting}
                ready={stats.readyForDelivery}
                onClickInProgress={() => router.push('/orders?status=in_progress')}
                onClickWaiting={() => router.push('/orders?status=waiting')}
                onClickReady={() => router.push('/orders?status=ready')}
              />
            ) : null}
          </div>

          {/* Upcoming Deliveries */}
          {deliveriesLoading ? (
            <Skeleton className="h-48" />
          ) : deliveries ? (
            <UpcomingDeliveries
              deliveries={deliveries}
              onNotifyCustomer={(id) => {
                // TODO: Implement notification
                console.log('Notify customer:', id)
              }}
            />
          ) : null}

          {/* AI Insights (mock) */}
          <AiSuggestionCard title="Insights do dia" className="hidden lg:block">
            <div className="space-y-1">
              <AiInsight insight="Revisões completas representam 55% do faturamento este mês" />
              <AiInsight insight="Segundas e terças são seus dias mais movimentados" />
              <AiInsight insight="Câmara 29&quot; está com alta demanda — considere reposição" />
            </div>
          </AiSuggestionCard>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Alerts Panel */}
          {alertsLoading ? (
            <Skeleton className="h-64" />
          ) : alerts ? (
            <AlertPanel alerts={alerts} />
          ) : null}

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Valor a receber</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-10 w-32" />
              ) : stats ? (
                <div>
                  <span className="text-3xl font-semibold text-text-primary">
                    {formatCurrency(stats.pendingDeliveryValue)}
                  </span>
                  <p className="text-sm text-text-secondary mt-1">
                    em entregas prontas
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
