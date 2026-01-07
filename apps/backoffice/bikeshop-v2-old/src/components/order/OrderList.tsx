'use client'

import Link from 'next/link'
import { Wrench, Clock, CheckCircle, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useOrders } from '@/hooks/useDataHooks'
import { Order, OrderStatus } from '@/types'
import { cn } from '@/lib/utils'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function getStatusConfig(status: OrderStatus) {
  switch (status) {
    case 'in_progress':
      return {
        label: 'Em trabalho',
        icon: Wrench,
        variant: 'default' as const,
        className: 'bg-primary/10 text-primary border-primary/20',
      }
    case 'waiting':
      return {
        label: 'Aguardando',
        icon: Clock,
        variant: 'secondary' as const,
        className: 'bg-muted text-muted-foreground border-muted',
      }
    case 'ready':
      return {
        label: 'Pronta',
        icon: CheckCircle,
        variant: 'success' as const,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      }
  }
}

function OrderListItem({ order }: { order: Order }) {
  const statusConfig = getStatusConfig(order.status)
  const StatusIcon = statusConfig.icon

  return (
    <Link href={`/orders/${order.id}`}>
      <li className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer">
        <div className={cn('p-2 rounded-lg', statusConfig.className.split(' ')[0])}>
          <StatusIcon className={cn('h-5 w-5', statusConfig.className.split(' ')[1])} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-foreground">
              {order.customerName}
            </p>
            <Badge variant="outline" className={cn('text-xs', statusConfig.className)}>
              {statusConfig.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {order.bikeLabel} · {order.serviceSummary}
          </p>
        </div>

        <div className="text-right">
          <p className="font-semibold">{formatCurrency(order.total)}</p>
        </div>

        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </li>
    </Link>
  )
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <div className="h-10 w-10 bg-muted rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-48" />
            <div className="h-3 bg-muted rounded w-64" />
          </div>
          <div className="h-4 bg-muted rounded w-20" />
        </div>
      ))}
    </div>
  )
}

export function OrderList() {
  const { data: orders, isLoading, error } = useOrders()

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Erro ao carregar ordens de serviço
        </CardContent>
      </Card>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Nenhuma ordem de serviço encontrada
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {orders.map((order) => (
            <OrderListItem key={order.id} order={order} />
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
