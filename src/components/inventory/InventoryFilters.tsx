'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type InventoryStatusFilter = 'all' | 'ok' | 'low' | 'out'
export type InventorySortOption = 'name' | 'qty' | 'low_first'

interface InventoryFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: InventoryStatusFilter
  onStatusChange: (value: InventoryStatusFilter) => void
  categoryFilter: string
  onCategoryChange: (value: string) => void
  sortBy: InventorySortOption
  onSortChange: (value: InventorySortOption) => void
  categories: string[]
}

export function InventoryFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  sortBy,
  onSortChange,
  categories,
}: InventoryFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou SKU..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as InventoryStatusFilter)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="ok">OK</SelectItem>
            <SelectItem value="low">Baixo</SelectItem>
            <SelectItem value="out">Ruptura</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => onSortChange(v as InventorySortOption)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nome</SelectItem>
            <SelectItem value="qty">Quantidade</SelectItem>
            <SelectItem value="low_first">Baixo estoque primeiro</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
