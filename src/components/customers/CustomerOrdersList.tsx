'use client'

import Link from 'next/link'
import { FileText, Wrench, Clock, CheckCircle, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCustomerOrders } from '@/hooks/useDataHooks'
import { Order, OrderStatus } from '@/types'
import { cn } from '@/lib/utils'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function getStatusConfig(status: OrderStatus) {
  switch (status) {
    case 'in_progress':
      return {
        label: 'Em trabalho',
        icon: Wrench,
        className: 'bg-primary/10 text-primary border-primary/20',
      }
    case 'waiting':
      return {
        label: 'Aguardando',
        icon: Clock,
        className: 'bg-muted text-muted-foreground border-muted',
      }
    case 'ready':
      return {
        label: 'Pronta',
        icon: CheckCircle,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      }
  }
}

function OrderItem({ order }: { order: Order }) {
  const statusConfig = getStatusConfig(order.status)
  const StatusIcon = statusConfig.icon

  return (
    <Link href={`/orders/${order.id}`}>
      <li className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer">
        <div className={cn('p-2 rounded-lg', statusConfig.className.split(' ')[0])}>
          <StatusIcon className={cn('h-4 w-4', statusConfig.className.split(' ')[1])} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-foreground text-sm">OS #{order.id}</p>
            <Badge variant="outline" className={cn('text-xs', statusConfig.className)}>
              {statusConfig.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {order.bikeLabel} · {order.serviceSummary}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="text-right">
          <p className="font-medium text-sm">{formatCurrency(order.total)}</p>
        </div>

        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </li>
    </Link>
  )
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse divide-y divide-border">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <div className="h-8 w-8 bg-muted rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-32" />
            <div className="h-3 bg-muted rounded w-48" />
          </div>
          <div className="h-4 bg-muted rounded w-20" />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-muted rounded-full">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>
      <p className="text-muted-foreground">Nenhuma ordem encontrada</p>
    </div>
  )
}

interface CustomerOrdersListProps {
  customerId: string
}

export function CustomerOrdersList({ customerId }: CustomerOrdersListProps) {
  const { data: orders, isLoading, error } = useCustomerOrders(customerId)

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <FileText className="h-5 w-5 text-muted-foreground" />
          Últimas Ordens
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="p-6 text-center text-muted-foreground">
            Erro ao carregar ordens
          </div>
        ) : !orders || orders.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="divide-y divide-border">
            {orders.map((order) => (
              <OrderItem key={order.id} order={order} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
