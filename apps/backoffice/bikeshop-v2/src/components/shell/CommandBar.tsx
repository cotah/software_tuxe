'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  Bike,
  Brain,
  Calendar,
  Home,
  Plus,
  Search,
  Users,
  Wrench,
} from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useCommandBarStore } from '@/store/commandBarStore'
import { useSearchOrders } from '@/hooks/useDataHooks'
import { useCanAccess } from '@/lib/access'

const actions = [
  { label: 'Ir para Dashboard', href: '/dashboard', icon: Home },
  { label: 'Ver Ordens de Servico', href: '/orders', icon: Wrench },
  { label: 'Abrir Agenda', href: '/agenda', icon: Calendar },
  { label: 'Clientes', href: '/customers', icon: Users },
  { label: 'Data', href: '/data', icon: BarChart3 },
  { label: 'AI', href: '/ai', icon: Brain },
]

export function CommandBar() {
  const router = useRouter()
  const { isOpen, query, close, setQuery, toggle } = useCommandBarStore()
  const { data: searchResults } = useSearchOrders(query)
  const canCreateOrder = useCanAccess('orders.create')

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
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

        <CommandGroup heading="Navegacao">
          {actions.map((action) => (
            <CommandItem key={action.href} onSelect={() => navigateTo(action.href)}>
              <action.icon className="mr-2 h-4 w-4" />
              <span>{action.label}</span>
            </CommandItem>
          ))}
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
            <CommandGroup heading="Ordens de Servico">
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
                      {order.bikeLabel} - {order.serviceSummary}
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
                  Atalho: <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl</kbd> +{' '}
                  <kbd className="px-1 py-0.5 bg-muted rounded text-xs">K</kbd>
                </div>
              </div>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
