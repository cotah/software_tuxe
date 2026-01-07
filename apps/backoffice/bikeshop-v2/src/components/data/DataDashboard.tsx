'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  DollarSign,
  FileText,
  Clock,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  BarChart3,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAnalyticsSummary } from '@/hooks/useDataHooks'
import { AnalyticsRange, AnalyticsOrderStatus } from '@/types'
import { cn } from '@/lib/utils'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatMinutesToHours(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date)
}

const STATUS_COLORS: Record<AnalyticsOrderStatus, string> = {
  ready: '#10b981',
  in_progress: '#3b82f6',
  waiting: '#f59e0b',
  delayed: '#ef4444',
}

const STATUS_LABELS: Record<AnalyticsOrderStatus, string> = {
  ready: 'Pronta',
  in_progress: 'Em progresso',
  waiting: 'Aguardando',
  delayed: 'Atrasada',
}

const CHANNEL_OPTIONS = [
  { value: 'all', label: 'Todos os canais' },
  { value: 'walk-in', label: 'Walk-in' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'partner', label: 'Parceiro' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os status' },
  { value: 'ready', label: 'Pronta' },
  { value: 'in_progress', label: 'Em progresso' },
  { value: 'waiting', label: 'Aguardando' },
  { value: 'delayed', label: 'Atrasada' },
]

const RANGE_OPTIONS: { value: AnalyticsRange; label: string }[] = [
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '90 dias' },
]

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      variant={active ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      className={cn(active && 'bg-primary text-primary-foreground')}
    >
      {children}
    </Button>
  )
}

function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
  isLoading,
}: {
  title: string
  value: string
  icon: React.ElementType
  trend?: string
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-8 w-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold text-foreground">{value}</p>
            {trend && (
              <div className="flex items-center gap-1 text-xs text-emerald-600">
                <TrendingUp className="h-3 w-3" />
                <span>{trend}</span>
              </div>
            )}
          </div>
          <div className="p-2.5 bg-muted rounded-lg">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ChartSkeleton() {
  return (
    <div className="animate-pulse h-64 bg-muted rounded-lg" />
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}

export function DataDashboard() {
  const [range, setRange] = useState<AnalyticsRange>('7d')
  const [status, setStatus] = useState('all')
  const [channel, setChannel] = useState('all')

  const queryClient = useQueryClient()

  const {
    data: summary,
    isLoading,
    error,
    refetch,
  } = useAnalyticsSummary(range, status, channel)

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['analytics'] })
    refetch()
  }

  if (error) {
    return (
      <div className="space-y-8">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              Erro ao carregar dados
            </p>
            <p className="text-muted-foreground mb-6">
              Não foi possível carregar os dados de analytics.
            </p>
            <Button onClick={handleRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hasData = summary && summary.revenueSeries.some((p) => p.revenue > 0)

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Período:</span>
          <div className="flex gap-1">
            {RANGE_OPTIONS.map((option) => (
              <FilterButton
                key={option.value}
                active={range === option.value}
                onClick={() => setRange(option.value)}
              >
                {option.label}
              </FilterButton>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Canal:</span>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {CHANNEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Receita"
          value={summary ? formatCurrency(summary.kpis.revenue) : 'R$ 0'}
          icon={DollarSign}
          trend={summary && summary.kpis.revenue > 0 ? '+12% vs período anterior' : undefined}
          isLoading={isLoading}
        />
        <KpiCard
          title="Ordens"
          value={summary ? String(summary.kpis.orders) : '0'}
          icon={FileText}
          trend={summary && summary.kpis.orders > 0 ? '+8% vs período anterior' : undefined}
          isLoading={isLoading}
        />
        <KpiCard
          title="Ticket Médio"
          value={summary ? formatCurrency(summary.kpis.avgTicket) : 'R$ 0'}
          icon={TrendingUp}
          isLoading={isLoading}
        />
        <KpiCard
          title="Tempo Médio"
          value={summary ? formatMinutesToHours(summary.kpis.avgLeadTimeMin) : '0min'}
          icon={Clock}
          isLoading={isLoading}
        />
        <KpiCard
          title="Atrasadas"
          value={summary ? String(summary.kpis.delayedCount) : '0'}
          icon={AlertTriangle}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Receita por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartSkeleton />
            ) : !hasData ? (
              <EmptyState message="Nenhum dado de receita disponível" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={summary?.revenueSeries || []}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatShortDate}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    tickFormatter={(v) => `R$${v / 1000}k`}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value) || 0), 'Receita']}
                    labelFormatter={formatShortDate}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">OS por Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartSkeleton />
            ) : !summary || summary.statusBreakdown.every((s) => s.count === 0) ? (
              <EmptyState message="Nenhuma ordem encontrada" />
            ) : (
              <div className="flex items-center gap-8">
                <ResponsiveContainer width="50%" height={280}>
                  <PieChart>
                    <Pie
                      data={summary.statusBreakdown.filter((s) => s.count > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="count"
                    >
                      {summary.statusBreakdown
                        .filter((s) => s.count > 0)
                        .map((entry) => (
                          <Cell
                            key={entry.status}
                            fill={STATUS_COLORS[entry.status]}
                          />
                        ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        Number(value) || 0,
                        STATUS_LABELS[name as AnalyticsOrderStatus] || String(name),
                      ]}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {summary.statusBreakdown
                    .filter((s) => s.count > 0)
                    .map((item) => (
                      <div key={item.status} className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: STATUS_COLORS[item.status] }}
                        />
                        <span className="text-sm text-foreground flex-1">
                          {STATUS_LABELS[item.status]}
                        </span>
                        <Badge variant="secondary">{item.count}</Badge>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Top Serviços por Receita</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ChartSkeleton />
          ) : !summary || summary.topServices.length === 0 ? (
            <EmptyState message="Nenhum serviço encontrado" />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={summary.topServices}
                layout="vertical"
                margin={{ left: 120 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => `R$${v}`}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  width={110}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value) || 0), 'Receita']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Detalhamento por Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-muted rounded" />
              ))}
            </div>
          ) : !summary || summary.topServices.length === 0 ? (
            <EmptyState message="Nenhum serviço encontrado" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Serviço
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                      Quantidade
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                      Receita
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                      Ticket Médio
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {summary.topServices.map((service, index) => (
                    <tr
                      key={service.name}
                      className={cn(
                        'border-b border-border hover:bg-muted/50 transition-colors cursor-pointer',
                        index === summary.topServices.length - 1 && 'border-b-0'
                      )}
                    >
                      <td className="py-3 px-4 text-sm font-medium text-foreground">
                        {service.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-foreground">
                        {service.count}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium text-foreground">
                        {formatCurrency(service.revenue)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-muted-foreground">
                        {formatCurrency(service.avgTicket)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
