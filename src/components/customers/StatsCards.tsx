'use client'

import { Users, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useCustomers } from '@/hooks/useDataHooks'

function StatCard({
  icon: Icon,
  label,
  value,
  isLoading,
}: {
  icon: React.ElementType
  label: string
  value: number
  isLoading: boolean
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-muted rounded-lg">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            {isLoading ? (
              <div className="h-7 w-12 bg-muted rounded animate-pulse mt-1" />
            ) : (
              <p className="text-2xl font-semibold text-foreground">{value}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsCards() {
  const { data: customers, isLoading } = useCustomers()

  const totalCustomers = customers?.length ?? 0
  const activeCustomers = customers?.filter((c) => c.status === 'active').length ?? 0
  const waitingCustomers = customers?.filter((c) => c.status === 'waiting').length ?? 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        icon={Users}
        label="Total de clientes"
        value={totalCustomers}
        isLoading={isLoading}
      />
      <StatCard
        icon={CheckCircle}
        label="Clientes ativos"
        value={activeCustomers}
        isLoading={isLoading}
      />
      <StatCard
        icon={Clock}
        label="Aguardando resposta"
        value={waitingCustomers}
        isLoading={isLoading}
      />
    </div>
  )
}
