'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { cn } from '@/lib/utils'
import { OrderCard, DraggableOrderCard } from '@/components/blocks/order-card'
import { ORDER_STATUS_LABELS, type Order, type OrderStatus } from '@/types'

interface KanbanBoardProps {
  orders: Order[]
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void
}

const KANBAN_COLUMNS: OrderStatus[] = [
  'received',
  'diagnosing',
  'in_progress',
  'ready',
]

export function KanbanBoard({ orders, onStatusChange }: KanbanBoardProps) {
  const router = useRouter()
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor)
  )

  const activeOrder = activeId ? orders.find((o) => o.id === activeId) : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const orderId = active.id as string
    const newStatus = over.id as OrderStatus

    // Check if dropped on a column
    if (KANBAN_COLUMNS.includes(newStatus)) {
      const order = orders.find((o) => o.id === orderId)
      if (order && order.status !== newStatus) {
        onStatusChange?.(orderId, newStatus)
      }
    }
  }

  const getOrdersByStatus = (status: OrderStatus) =>
    orders.filter((o) => o.status === status)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 px-1">
        {KANBAN_COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            orders={getOrdersByStatus(status)}
            onOrderClick={(id) => router.push(`/orders/${id}`)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeOrder && <OrderCard order={activeOrder} isDragging />}
      </DragOverlay>
    </DndContext>
  )
}

interface KanbanColumnProps {
  status: OrderStatus
  orders: Order[]
  onOrderClick: (id: string) => void
}

function KanbanColumn({ status, orders, onOrderClick }: KanbanColumnProps) {
  const columnColors: Record<OrderStatus, string> = {
    received: 'border-t-gray-400',
    diagnosing: 'border-t-blue-400',
    waiting_approval: 'border-t-amber-400',
    in_progress: 'border-t-indigo-400',
    ready: 'border-t-green-400',
    delivered: 'border-t-gray-300',
  }

  return (
    <div
      className={cn(
        'flex-shrink-0 w-72 lg:w-80 bg-surface-secondary rounded-xl border-t-4',
        columnColors[status]
      )}
    >
      {/* Column Header */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-text-primary">
            {ORDER_STATUS_LABELS[status]}
          </h3>
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-xs font-medium text-text-secondary">
            {orders.length}
          </span>
        </div>
      </div>

      {/* Droppable area */}
      <SortableContext
        id={status}
        items={orders.map((o) => o.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="p-2 pt-0 min-h-[200px] space-y-3">
          {orders.length === 0 ? (
            <div className="flex items-center justify-center h-32 border-2 border-dashed border-border rounded-xl text-text-tertiary text-sm">
              Arraste uma OS aqui
            </div>
          ) : (
            orders.map((order) => (
              <DraggableOrderCard
                key={order.id}
                order={order}
                onClick={() => onOrderClick(order.id)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}
