'use client'

import { Bike, Send, CheckCircle, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import type { UpcomingDelivery } from '@/types'

interface UpcomingDeliveriesProps {
  deliveries: UpcomingDelivery[]
  onNotifyCustomer?: (id: string) => void
}

export function UpcomingDeliveries({
  deliveries,
  onNotifyCustomer,
}: UpcomingDeliveriesProps) {
  if (deliveries.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-secondary mb-3">
            <Bike className="h-6 w-6 text-text-tertiary" />
          </div>
          <p className="text-text-secondary">
            Nenhuma entrega prevista para hoje.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bike className="h-4 w-4 text-brand-500" />
          Próximas Entregas
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {deliveries.map((delivery) => (
            <DeliveryItem
              key={delivery.id}
              delivery={delivery}
              onNotify={() => onNotifyCustomer?.(delivery.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function DeliveryItem({
  delivery,
  onNotify,
}: {
  delivery: UpcomingDelivery
  onNotify: () => void
}) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-surface-secondary hover:bg-surface-tertiary transition-colors">
      {/* Customer & Bike info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-text-primary truncate">
            {delivery.customerName}
          </span>
          {delivery.isToday && (
            <Badge variant="info">Hoje</Badge>
          )}
        </div>
        <p className="text-sm text-text-secondary truncate">
          {delivery.bikeName} • {delivery.serviceSummary}
        </p>
      </div>

      {/* Value */}
      <div className="text-right">
        <span className="font-medium text-text-primary">
          {formatCurrency(delivery.value)}
        </span>
      </div>

      {/* Action */}
      <div className="flex-shrink-0">
        {delivery.customerNotified ? (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Avisado
          </Badge>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation()
              onNotify()
            }}
            className="h-8"
          >
            <Send className="h-3.5 w-3.5 mr-1" />
            Avisar
          </Button>
        )}
      </div>
    </div>
  )
}
