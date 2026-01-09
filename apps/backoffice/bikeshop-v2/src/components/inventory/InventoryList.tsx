'use client'

import { useState, useMemo } from 'react'
import { Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useInventory } from '@/hooks/useInventoryHooks'
import { InventorySummaryCards } from './InventorySummaryCards'
import { InventoryFilters, InventoryStatusFilter, InventorySortOption } from './InventoryFilters'
import { InventoryRow, InventoryRowSkeleton } from './InventoryRow'
import { InventoryItem, InventoryStatus } from '@/types'

function getItemStatus(item: InventoryItem): InventoryStatus {
  if (item.qty === 0) return 'out'
  if (item.qty < item.minQty) return 'low'
  return 'ok'
}

export function InventoryList() {
  const { data: items = [], isLoading, isError, refetch } = useInventory()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<InventoryStatusFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState<InventorySortOption>('name')

  const categories = useMemo(() => {
    const cats = new Set(items.map((item) => item.category))
    return Array.from(cats).sort()
  }, [items])

  const filteredItems = useMemo(() => {
    let result = [...items]

    // Search filter
    if (search.trim()) {
      const query = search.toLowerCase()
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((item) => {
        const status = getItemStatus(item)
        return status === statusFilter
      })
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((item) => item.category === categoryFilter)
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'qty':
          return b.qty - a.qty
        case 'low_first': {
          const statusA = getItemStatus(a)
          const statusB = getItemStatus(b)
          const order: Record<InventoryStatus, number> = { out: 0, low: 1, ok: 2 }
          if (order[statusA] !== order[statusB]) {
            return order[statusA] - order[statusB]
          }
          return a.name.localeCompare(b.name)
        }
        default:
          return 0
      }
    })

    return result
  }, [items, search, statusFilter, categoryFilter, sortBy])

  if (isError) {
    return (
      <div className="space-y-6">
        <InventorySummaryCards items={[]} isLoading={false} />
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Erro ao carregar estoque</p>
              <button
                onClick={() => refetch()}
                className="text-primary hover:underline text-sm"
              >
                Tentar novamente
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <InventorySummaryCards items={items} isLoading={isLoading} />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Itens do Estoque</CardTitle>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Carregando...' : `${filteredItems.length} itens`}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <InventoryFilters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            categories={categories}
          />

          <div className="space-y-2">
            {isLoading ? (
              <>
                <InventoryRowSkeleton />
                <InventoryRowSkeleton />
                <InventoryRowSkeleton />
                <InventoryRowSkeleton />
                <InventoryRowSkeleton />
              </>
            ) : filteredItems.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {search || statusFilter !== 'all' || categoryFilter !== 'all'
                    ? 'Nenhum item encontrado com os filtros aplicados'
                    : 'Nenhum item cadastrado no estoque'}
                </p>
                {(search || statusFilter !== 'all' || categoryFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearch('')
                      setStatusFilter('all')
                      setCategoryFilter('all')
                    }}
                    className="text-primary hover:underline text-sm mt-2"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            ) : (
              filteredItems.map((item) => (
                <InventoryRow key={item.id} item={item} />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
