'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, LayoutGrid, List } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { KanbanBoard } from '@/features/orders/components/kanban-board'
import type { OrderStatus } from '@/types'

export default function OrdersPage() {
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.orders.list()
      return res.data
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string
      status: OrderStatus
    }) => {
      return api.orders.updateStatus(orderId, status)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-surface-secondary border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading text-text-primary">
                Ordens de Serviço
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                {orders?.length || 0} ordens no total
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="hidden sm:flex items-center gap-1 p-1 bg-white rounded-lg border border-border">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'kanban'
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova OS
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-72 lg:w-80 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ))}
          </div>
        ) : orders && viewMode === 'kanban' ? (
          <KanbanBoard
            orders={orders}
            onStatusChange={(orderId, newStatus) => {
              updateStatusMutation.mutate({ orderId, status: newStatus })
            }}
          />
        ) : (
          // List view placeholder
          <div className="text-center py-12 text-text-secondary">
            Visualização em lista em desenvolvimento
          </div>
        )}
      </div>
    </div>
  )
}
