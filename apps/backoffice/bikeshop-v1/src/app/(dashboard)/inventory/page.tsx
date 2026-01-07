'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Search, Package, AlertTriangle, AlertCircle, Filter } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { InventoryRow, InventorySuggestionItem } from '@/components/blocks/inventory-row'
import { AiSuggestionCard } from '@/components/blocks/ai-suggestion'
import type { InventoryStatus } from '@/types'

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<InventoryStatus | 'all'>('all')

  const { data: inventory, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await api.inventory.list()
      return res.data
    },
  })

  // Filter items
  const filteredItems = inventory?.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Count by status
  const zeroCount = inventory?.filter((i) => i.status === 'zero').length || 0
  const lowCount = inventory?.filter((i) => i.status === 'low').length || 0
  const okCount = inventory?.filter((i) => i.status === 'ok').length || 0

  // Items that need attention (for AI suggestion)
  const criticalItems =
    inventory?.filter((i) => i.status === 'zero' || i.status === 'low') || []

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-heading text-text-primary">Estoque</h1>
          <p className="text-sm text-text-secondary mt-1">
            {inventory?.length || 0} itens cadastrados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary">
            <Package className="h-4 w-4 mr-2" />
            Dar entrada
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar peça
          </Button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => setStatusFilter(statusFilter === 'zero' ? 'all' : 'zero')}
          className={`p-4 rounded-xl border transition-all ${
            statusFilter === 'zero'
              ? 'border-status-error bg-status-error-bg'
              : 'border-border bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-status-error-bg">
              <AlertCircle className="h-5 w-5 text-status-error" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-semibold text-text-primary">
                {zeroCount}
              </span>
              <p className="text-sm text-text-secondary">Zerados</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'low' ? 'all' : 'low')}
          className={`p-4 rounded-xl border transition-all ${
            statusFilter === 'low'
              ? 'border-status-warning bg-status-warning-bg'
              : 'border-border bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-status-warning-bg">
              <AlertTriangle className="h-5 w-5 text-status-warning" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-semibold text-text-primary">
                {lowCount}
              </span>
              <p className="text-sm text-text-secondary">Baixos</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'ok' ? 'all' : 'ok')}
          className={`p-4 rounded-xl border transition-all ${
            statusFilter === 'ok'
              ? 'border-status-success bg-status-success-bg'
              : 'border-border bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-status-success-bg">
              <Package className="h-5 w-5 text-status-success" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-semibold text-text-primary">
                {okCount}
              </span>
              <p className="text-sm text-text-secondary">OK</p>
            </div>
          </div>
        </button>
      </div>

      {/* AI Suggestion */}
      {criticalItems.length > 0 && (
        <AiSuggestionCard title="Sugestão de reposição" className="mb-6">
          <div className="divide-y divide-ai-100">
            {criticalItems.slice(0, 3).map((item) => (
              <InventorySuggestionItem key={item.id} item={item} />
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="secondary" className="bg-white">
              Ignorar
            </Button>
            <Button size="sm" variant="secondary" className="bg-white">
              Marcar para comprar
            </Button>
          </div>
        </AiSuggestionCard>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <Input
            placeholder="Buscar peça..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {statusFilter !== 'all' && (
          <Button
            variant="secondary"
            onClick={() => setStatusFilter('all')}
            className="shrink-0"
          >
            <Filter className="h-4 w-4 mr-2" />
            Limpar filtro
          </Button>
        )}
      </div>

      {/* Items List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : filteredItems?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary">
              {searchQuery || statusFilter !== 'all'
                ? 'Nenhum item encontrado com os filtros aplicados'
                : 'Nenhum item cadastrado no estoque'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredItems?.map((item) => (
            <InventoryRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
