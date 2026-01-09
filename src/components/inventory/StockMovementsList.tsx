'use client'

import { ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StockMovement, StockMovementType } from '@/types'

interface StockMovementsListProps {
  movements: StockMovement[]
  isLoading?: boolean
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const typeConfig: Record<StockMovementType, { label: string; icon: typeof ArrowUpCircle; color: string }> = {
  in: { label: 'Entrada', icon: ArrowDownCircle, color: 'text-emerald-600' },
  out: { label: 'Saída', icon: ArrowUpCircle, color: 'text-red-600' },
  adjust: { label: 'Ajuste', icon: RefreshCw, color: 'text-blue-600' },
}

function MovementSkeleton() {
  return (
    <div className="flex items-start gap-3 py-3 animate-pulse">
      <div className="h-5 w-5 bg-muted rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-3 w-48 bg-muted rounded" />
      </div>
      <div className="h-4 w-20 bg-muted rounded" />
    </div>
  )
}

export function StockMovementsList({ movements, isLoading }: StockMovementsListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            <MovementSkeleton />
            <MovementSkeleton />
            <MovementSkeleton />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (movements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhuma movimentação registrada
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Movimentações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {movements.map((movement) => {
            const config = typeConfig[movement.type]
            const Icon = config.icon

            return (
              <div key={movement.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{config.label}</span>
                    <span className={`font-semibold text-sm ${config.color}`}>
                      {movement.type === 'out' ? '-' : movement.type === 'in' ? '+' : ''}
                      {Math.abs(movement.qty)}
                    </span>
                  </div>
                  {movement.note && (
                    <p className="text-sm text-muted-foreground truncate">{movement.note}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {movement.createdBy} · {formatDate(movement.createdAt)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
