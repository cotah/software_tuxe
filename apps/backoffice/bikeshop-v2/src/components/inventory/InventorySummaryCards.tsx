'use client'

import { Package, AlertTriangle, XCircle, DollarSign } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { InventoryItem } from '@/types'

interface InventorySummaryCardsProps {
  items: InventoryItem[]
  isLoading?: boolean
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-8 w-16 bg-muted rounded" />
        </div>
      </CardContent>
    </Card>
  )
}

export function InventorySummaryCards({ items, isLoading }: InventorySummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  const totalItems = items.length
  const lowStockItems = items.filter((item) => item.qty > 0 && item.qty < item.minQty).length
  const outOfStockItems = items.filter((item) => item.qty === 0).length
  const estimatedValue = items.reduce((sum, item) => sum + item.qty * item.unitCost, 0)

  const cards = [
    {
      title: 'Itens em estoque',
      value: totalItems.toString(),
      icon: Package,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Baixo estoque',
      value: lowStockItems.toString(),
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Ruptura',
      value: outOfStockItems.toString(),
      icon: XCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Valor estimado',
      value: formatCurrency(estimatedValue),
      icon: DollarSign,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-semibold tracking-tight">{card.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
