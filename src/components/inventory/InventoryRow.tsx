'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { InventoryItem, InventoryStatus } from '@/types'

interface InventoryRowProps {
  item: InventoryItem
}

function getItemStatus(item: InventoryItem): InventoryStatus {
  if (item.qty === 0) return 'out'
  if (item.qty < item.minQty) return 'low'
  return 'ok'
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const statusConfig: Record<InventoryStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  ok: { label: 'OK', variant: 'secondary' },
  low: { label: 'Baixo', variant: 'outline' },
  out: { label: 'Ruptura', variant: 'destructive' },
}

export function InventoryRow({ item }: InventoryRowProps) {
  const status = getItemStatus(item)
  const config = statusConfig[status]

  return (
    <Link
      href={`/inventory/${item.id}`}
      className="block group"
    >
      <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {item.name}
            </h3>
            <Badge variant={config.variant} className={status === 'low' ? 'border-amber-500 text-amber-600' : ''}>
              {config.label}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="font-mono">{item.sku}</span>
            <span>{item.category}</span>
            <span>{formatCurrency(item.unitCost)}</span>
          </div>
        </div>

        <div className="flex items-center gap-6 ml-4">
          <div className="text-right">
            <p className={`text-lg font-semibold ${status === 'out' ? 'text-red-600' : status === 'low' ? 'text-amber-600' : 'text-foreground'}`}>
              {item.qty}
            </p>
            <p className="text-xs text-muted-foreground">
              mín: {item.minQty}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </Link>
  )
}

export function InventoryRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card animate-pulse">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-5 w-40 bg-muted rounded" />
          <div className="h-5 w-16 bg-muted rounded" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
        </div>
      </div>
      <div className="flex items-center gap-6 ml-4">
        <div className="text-right space-y-1">
          <div className="h-6 w-8 bg-muted rounded" />
          <div className="h-3 w-12 bg-muted rounded" />
        </div>
        <div className="h-5 w-5 bg-muted rounded" />
      </div>
    </div>
  )
}
