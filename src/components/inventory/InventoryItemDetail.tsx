'use client'

import Link from 'next/link'
import { ArrowLeft, Package, MapPin, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useInventoryItem, useStockMovements, useCreateStockMovement, useUpdateMinQty } from '@/hooks/useInventoryHooks'
import { StockMovementDialog } from './StockMovementDialog'
import { StockMovementsList } from './StockMovementsList'
import { InventoryStatus } from '@/types'

interface InventoryItemDetailProps {
  id: string
}

function getItemStatus(qty: number, minQty: number): InventoryStatus {
  if (qty === 0) return 'out'
  if (qty < minQty) return 'low'
  return 'ok'
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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const statusConfig: Record<InventoryStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; bgColor: string }> = {
  ok: { label: 'OK', variant: 'secondary', bgColor: 'bg-emerald-50' },
  low: { label: 'Baixo estoque', variant: 'outline', bgColor: 'bg-amber-50' },
  out: { label: 'Ruptura', variant: 'destructive', bgColor: 'bg-red-50' },
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-9 w-32 bg-muted rounded" />
      <div className="space-y-2">
        <div className="h-8 w-64 bg-muted rounded" />
        <div className="h-5 w-32 bg-muted rounded" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
        <div className="space-y-6">
          <div className="h-48 bg-muted rounded-lg" />
          <div className="h-32 bg-muted rounded-lg" />
        </div>
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    </div>
  )
}

export function InventoryItemDetail({ id }: InventoryItemDetailProps) {
  const { data: item, isLoading: itemLoading, isError } = useInventoryItem(id)
  const { data: movements = [], isLoading: movementsLoading } = useStockMovements(id)
  const createMovement = useCreateStockMovement()
  const updateMinQty = useUpdateMinQty()

  if (itemLoading) {
    return <DetailSkeleton />
  }

  if (isError || !item) {
    return (
      <div className="space-y-6">
        <Link href="/inventory">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao estoque
          </Button>
        </Link>
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">Item não encontrado</p>
              <Link href="/inventory">
                <Button variant="outline">Voltar ao estoque</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const status = getItemStatus(item.qty, item.minQty)
  const config = statusConfig[status]

  const handleCreateMovement = (type: 'in' | 'out') => (data: { qty: number; note?: string }) => {
    createMovement.mutate({
      itemId: id,
      type,
      qty: data.qty,
      note: data.note,
    })
  }

  const handleUpdateMinQty = (minQty: number) => {
    updateMinQty.mutate({ id, minQty })
  }

  return (
    <div className="space-y-6">
      <Link href="/inventory">
        <Button variant="ghost" size="sm" className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao estoque
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{item.name}</h1>
            <Badge variant={config.variant} className={status === 'low' ? 'border-amber-500 text-amber-600' : ''}>
              {config.label}
            </Badge>
          </div>
          <p className="text-muted-foreground font-mono">{item.sku}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
        {/* Left Column */}
        <div className="space-y-6 order-2 lg:order-1">
          {/* Stock Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações do Estoque</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${config.bgColor}`}>
                  <p className="text-sm text-muted-foreground">Quantidade atual</p>
                  <p className={`text-3xl font-bold ${status === 'out' ? 'text-red-600' : status === 'low' ? 'text-amber-600' : 'text-foreground'}`}>
                    {item.qty}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Mínimo recomendado</p>
                  <p className="text-3xl font-bold text-foreground">{item.minQty}</p>
                </div>
              </div>

              {status !== 'ok' && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 text-amber-800">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-sm">
                    {status === 'out'
                      ? 'Este item está em ruptura de estoque'
                      : `Estoque abaixo do mínimo. Recomendado repor ${item.minQty - item.qty} unidade(s)`}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Categoria</p>
                  <p className="font-medium">{item.category}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Custo unitário</p>
                  <p className="font-medium">{formatCurrency(item.unitCost)}</p>
                </div>
                {item.unitPrice && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Preço de venda</p>
                    <p className="font-medium">{formatCurrency(item.unitPrice)}</p>
                  </div>
                )}
                {item.location && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>Localização</span>
                    </div>
                    <p className="font-medium">{item.location}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2">
                <Clock className="h-3 w-3" />
                <span>Atualizado em {formatDate(item.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <StockMovementDialog
                  type="in"
                  itemName={item.name}
                  currentQty={item.qty}
                  currentMinQty={item.minQty}
                  onSubmit={handleCreateMovement('in')}
                  isPending={createMovement.isPending}
                />
                <StockMovementDialog
                  type="out"
                  itemName={item.name}
                  currentQty={item.qty}
                  currentMinQty={item.minQty}
                  onSubmit={handleCreateMovement('out')}
                  isPending={createMovement.isPending}
                />
                <StockMovementDialog
                  type="adjust"
                  itemName={item.name}
                  currentQty={item.qty}
                  currentMinQty={item.minQty}
                  onSubmit={() => {}}
                  onUpdateMinQty={handleUpdateMinQty}
                  isPending={updateMinQty.isPending}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="order-1 lg:order-2">
          <StockMovementsList movements={movements} isLoading={movementsLoading} />
        </div>
      </div>
    </div>
  )
}
