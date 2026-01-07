'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, Brain, Home, Package, Settings, Users, Wrench } from 'lucide-react'
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

const actions = [
  { label: 'Ir para Command Center', href: '/dashboard', icon: Home },
  { label: 'Ver Ordens de Servico', href: '/orders', icon: Wrench },
  { label: 'Clientes', href: '/customers', icon: Users },
  { label: 'Estoque', href: '/inventory', icon: Package },
  { label: 'Data', href: '/data', icon: BarChart3 },
  { label: 'AI', href: '/ai', icon: Brain },
  { label: 'Configuracoes', href: '/settings', icon: Settings },
]

export function CommandBar() {
  const router = useRouter()
  const { isOpen, query, close, setQuery, toggle } = useCommandBarStore()

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
        placeholder="Buscar ou navegar..."
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
        </CommandGroup>

        <CommandSeparator />
        <CommandGroup heading="Dicas">
          <div className="px-2 py-3 text-sm text-muted-foreground">
            Use Ctrl + K para abrir rapidamente a barra de comando.
          </div>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
