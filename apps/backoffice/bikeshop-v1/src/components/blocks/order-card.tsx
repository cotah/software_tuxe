'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Clock, AlertTriangle, CheckCircle, Send } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency, formatRelativeTime } from '@/lib/utils'
import type { Order } from '@/types'

interface OrderCardProps {
  order: Order
  onClick?: () => void
  isDragging?: boolean
}

export function OrderCard({ order, onClick, isDragging }: OrderCardProps) {
  return (
    <Card
      interactive
      onClick={onClick}
      className={cn(
        'p-4 cursor-pointer',
        isDragging && 'opacity-50 shadow-elevated rotate-2',
        order.isOverdue && 'border-status-warning'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-sm font-semibold text-text-primary">
            #{order.orderNumber}
          </span>
          <h3 className="text-sm font-medium text-text-primary mt-0.5">
            {order.customerName}
          </h3>
        </div>
        {order.isOverdue && (
          <Badge variant="warning" pulse className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            <span>Atraso</span>
          </Badge>
        )}
      </div>

      {/* Bike info */}
      <p className="text-sm text-text-secondary mb-2">{order.bikeName}</p>

      {/* Service summary */}
      {order.services.length > 0 && (
        <p className="text-sm text-text-secondary line-clamp-1">
          {order.services.map((s) => s.name).join(', ')}
        </p>
      )}
      {order.notes && order.services.length === 0 && (
        <p className="text-sm text-text-secondary line-clamp-1 italic">
          {order.notes}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5 text-text-tertiary">
          <Clock className="h-3.5 w-3.5" />
          <span className="text-xs">{formatRelativeTime(order.createdAt)}</span>
        </div>
        
        {order.totalValue > 0 && (
          <span className="text-sm font-medium text-text-primary">
            {formatCurrency(order.totalValue)}
          </span>
        )}
      </div>

      {/* Delivery info for ready orders */}
      {order.status === 'ready' && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          {order.customerNotified ? (
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              <span>Cliente avisado</span>
            </Badge>
          ) : (
            <Button size="sm" variant="secondary" className="h-7 text-xs">
              <Send className="h-3 w-3 mr-1" />
              Avisar cliente
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

// Draggable version for Kanban
export function DraggableOrderCard({ order, onClick }: OrderCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: order.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <OrderCard order={order} onClick={onClick} isDragging={isDragging} />
    </div>
  )
}
