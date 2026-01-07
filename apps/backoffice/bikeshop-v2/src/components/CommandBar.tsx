'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, FileText, Plus, Bike, Search } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useCommandBarStore } from '@/store/commandBarStore'
import { useSearchOrders } from '@/hooks/useDataHooks'
import { useCanAccess } from '@/lib/access'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function CommandBar() {
  const router = useRouter()
  const { isOpen, query, close, setQuery, toggle } = useCommandBarStore()
  const { data: searchResults } = useSearchOrders(query)
  const canCreateOrder = useCanAccess('orders.create')

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggle()
      }
    },
    [toggle]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const runCommand = useCallback(
    (command: () => void) => {
      close()
      command()
    },
    [close]
  )

  const navigateTo = useCallback(
    (path: string) => {
      runCommand(() => router.push(path))
    },
    [router, runCommand]
  )

  return (
    <CommandDialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <CommandInput
        placeholder="Buscar ordens, clientes ou navegar..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

        <CommandGroup heading="Navegação">
          <CommandItem onSelect={() => navigateTo('/dashboard')}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Ir para Command Center</span>
          </CommandItem>
          <CommandItem onSelect={() => navigateTo('/orders')}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Ver todas OS</span>
          </CommandItem>
          {canCreateOrder ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <CommandItem disabled onSelect={() => {}}>
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="text-muted-foreground">Criar OS</span>
                  <span className="ml-auto text-xs text-muted-foreground">Em breve</span>
                </CommandItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>Funcionalidade em breve</p>
              </TooltipContent>
            </Tooltip>
          ) : null}
        </CommandGroup>

        {query && searchResults && searchResults.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Ordens de Serviço">
              {searchResults.slice(0, 5).map((order) => (
                <CommandItem
                  key={order.id}
                  value={`${order.customerName} ${order.bikeLabel}`}
                  onSelect={() => navigateTo(`/orders/${order.id}`)}
                >
                  <Bike className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{order.customerName}</span>
                    <span className="text-xs text-muted-foreground">
                      {order.bikeLabel} · {order.serviceSummary}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {!query && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Dicas">
              <div className="px-2 py-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <span>Digite para buscar por cliente ou bike</span>
                </div>
                <div className="mt-2 text-xs">
                  Atalho: <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-muted rounded text-xs">K</kbd>
                </div>
              </div>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
