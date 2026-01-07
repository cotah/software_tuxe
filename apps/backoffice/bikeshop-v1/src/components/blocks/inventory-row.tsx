'use client'

import { Package, AlertTriangle, AlertCircle, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency } from '@/lib/utils'
import type { InventoryItem } from '@/types'

interface InventoryRowProps {
  item: InventoryItem
  onClick?: () => void
}

export function InventoryRow({ item, onClick }: InventoryRowProps) {
  const percentage = Math.min((item.quantity / (item.minQuantity * 2)) * 100, 100)
  
  const statusConfig = {
    ok: {
      badge: 'success' as const,
      label: 'OK',
      barColor: 'bg-status-success',
    },
    low: {
      badge: 'warning' as const,
      label: 'Baixo',
      barColor: 'bg-status-warning',
    },
    zero: {
      badge: 'error' as const,
      label: 'Zerado',
      barColor: 'bg-status-error',
    },
  }

  const config = statusConfig[item.status]

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl border border-border bg-white transition-all duration-150',
        'hover:shadow-card hover:border-gray-300 cursor-pointer',
        item.status === 'zero' && 'border-status-error/30 bg-status-error-bg/30'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-lg',
          item.status === 'ok' && 'bg-gray-100 text-gray-500',
          item.status === 'low' && 'bg-status-warning-bg text-status-warning',
          item.status === 'zero' && 'bg-status-error-bg text-status-error'
        )}
      >
        {item.status === 'zero' ? (
          <AlertCircle className="h-5 w-5" />
        ) : item.status === 'low' ? (
          <AlertTriangle className="h-5 w-5" />
        ) : (
          <Package className="h-5 w-5" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-text-primary truncate">{item.name}</h3>
          <Badge variant={config.badge}>{config.label}</Badge>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-text-secondary">
          <span>Estoque: {item.quantity} un.</span>
          <span>Custo: {formatCurrency(item.cost)}</span>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1.5 w-full max-w-[200px] rounded-full bg-gray-100">
          <div
            className={cn('h-full rounded-full transition-all', config.barColor)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Usage indicator */}
      {item.recentUsage > 0 && (
        <div className="flex items-center gap-1.5 text-sm text-text-tertiary">
          <TrendingUp className="h-4 w-4" />
          <span>{item.recentUsage} este mês</span>
        </div>
      )}
    </div>
  )
}

// Compact version for suggestions
export function InventorySuggestionItem({ item }: { item: InventoryItem }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'w-2 h-2 rounded-full',
            item.status === 'zero' ? 'bg-status-error' : 'bg-status-warning'
          )}
        />
        <span className="text-sm text-text-primary">{item.name}</span>
      </div>
      <div className="text-sm text-text-secondary">
        {item.quantity} un. • {item.recentUsage} usadas este mês
      </div>
    </div>
  )
}
