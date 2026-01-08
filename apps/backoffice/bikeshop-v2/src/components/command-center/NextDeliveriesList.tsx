'use client'

import Link from 'next/link'
import { Truck, Check, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Order } from '@/types'
import { useNotifyOrder } from '@/hooks/useDataHooks'

interface NextDeliveriesListProps {
  orders: Order[]
}

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
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function NextDeliveriesList({ orders }: NextDeliveriesListProps) {
  const notifyMutation = useNotifyOrder()

  const readyOrders = orders
    .filter((order) => order.status === 'ready')
    .sort((a, b) => new Date(a.promisedAt).getTime() - new Date(b.promisedAt).getTime())

  const totalValue = readyOrders.reduce((acc, order) => acc + order.total, 0)

  const handleNotify = (orderId: string) => {
    notifyMutation.mutate(orderId)
  }

  if (readyOrders.length === 0) {
    return null
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Próximas entregas
        </h2>
        <span className="text-sm font-semibold text-emerald-600">
          Total: {formatCurrency(totalValue)}
        </span>
      </div>

      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {readyOrders.map((order) => {
              const isNotifying = notifyMutation.isPending && notifyMutation.variables === order.id

              return (
                <li
                  key={order.id}
                  className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <Truck className="h-4 w-4 text-emerald-600" />
                  </div>

                  <Link
                    href={`/orders/${order.id}`}
                    className="flex-1 min-w-0 group"
                  >
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {order.customerName}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {order.bikeLabel} · {order.serviceSummary}
                    </p>
                  </Link>

                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(order.total)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.promisedAt)}
                    </p>
                  </div>

                  {order.notified ? (
                    <Badge variant="success" className="gap-1">
                      <Check className="h-3 w-3" />
                      Avisado
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNotify(order.id)}
                      disabled={isNotifying}
                    >
                      {isNotifying ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Avisar'
                      )}
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>
    </section>
  )
}
