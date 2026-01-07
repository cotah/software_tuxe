'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Wrench,
  Calendar,
  Package,
  Settings,
  Plus,
  Search,
  FileText,
  ArrowRight,
} from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useUIStore } from '@/stores/ui-store'
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ReactNode
  shortcut?: string
  category: 'navigation' | 'action' | 'recent'
  action: () => void
}

export function CommandBar() {
  const router = useRouter()
  const { commandBarOpen, closeCommandBar, toggleCommandBar } = useUIStore()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Toggle with Cmd+K
  useKeyboardShortcut('k', toggleCommandBar, { meta: true })

  // All available commands
  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    {
      id: 'nav-home',
      label: 'Command Center',
      description: 'Visão geral do dia',
      icon: <LayoutDashboard className="h-4 w-4" />,
      shortcut: '⌘1',
      category: 'navigation',
      action: () => { router.push('/'); closeCommandBar() },
    },
    {
      id: 'nav-customers',
      label: 'Clientes',
      description: 'Gerenciar clientes e conversas',
      icon: <Users className="h-4 w-4" />,
      shortcut: '⌘2',
      category: 'navigation',
      action: () => { router.push('/customers'); closeCommandBar() },
    },
    {
      id: 'nav-orders',
      label: 'Ordens de Serviço',
      description: 'Visualizar e gerenciar OS',
      icon: <Wrench className="h-4 w-4" />,
      shortcut: '⌘3',
      category: 'navigation',
      action: () => { router.push('/orders'); closeCommandBar() },
    },
    {
      id: 'nav-calendar',
      label: 'Agenda',
      description: 'Ver agendamentos',
      icon: <Calendar className="h-4 w-4" />,
      shortcut: '⌘4',
      category: 'navigation',
      action: () => { router.push('/calendar'); closeCommandBar() },
    },
    {
      id: 'nav-inventory',
      label: 'Estoque',
      description: 'Gerenciar peças e produtos',
      icon: <Package className="h-4 w-4" />,
      shortcut: '⌘5',
      category: 'navigation',
      action: () => { router.push('/inventory'); closeCommandBar() },
    },
    {
      id: 'nav-settings',
      label: 'Configurações',
      description: 'Ajustar preferências',
      icon: <Settings className="h-4 w-4" />,
      category: 'navigation',
      action: () => { router.push('/settings'); closeCommandBar() },
    },
    // Actions
    {
      id: 'action-new-order',
      label: 'Nova Ordem de Serviço',
      description: 'Criar nova OS',
      icon: <Plus className="h-4 w-4" />,
      shortcut: '⌘N',
      category: 'action',
      action: () => { router.push('/orders/new'); closeCommandBar() },
    },
    {
      id: 'action-new-customer',
      label: 'Novo Cliente',
      description: 'Cadastrar cliente',
      icon: <Plus className="h-4 w-4" />,
      category: 'action',
      action: () => { router.push('/customers/new'); closeCommandBar() },
    },
    // Recent (mock)
    {
      id: 'recent-os42',
      label: 'OS #42 - João Silva',
      description: 'Revisão completa',
      icon: <FileText className="h-4 w-4" />,
      category: 'recent',
      action: () => { router.push('/orders/1'); closeCommandBar() },
    },
    {
      id: 'recent-os45',
      label: 'OS #45 - Carlos Mendes',
      description: 'Em diagnóstico',
      icon: <FileText className="h-4 w-4" />,
      category: 'recent',
      action: () => { router.push('/orders/2'); closeCommandBar() },
    },
  ], [router, closeCommandBar])

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query) return commands
    const lowerQuery = query.toLowerCase()
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lowerQuery) ||
        cmd.description?.toLowerCase().includes(lowerQuery)
    )
  }, [commands, query])

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {
      recent: [],
      action: [],
      navigation: [],
    }
    filteredCommands.forEach((cmd) => {
      groups[cmd.category].push(cmd)
    })
    return groups
  }, [filteredCommands])

  // Reset state when dialog opens
  useEffect(() => {
    if (commandBarOpen) {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [commandBarOpen])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      filteredCommands[selectedIndex]?.action()
    }
  }

  const CATEGORY_LABELS: Record<string, string> = {
    recent: 'Recentes',
    action: 'Ações',
    navigation: 'Navegação',
  }

  let flatIndex = -1

  return (
    <Dialog open={commandBarOpen} onOpenChange={closeCommandBar}>
      <DialogContent className="p-0 gap-0 max-w-xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search className="h-5 w-5 text-text-tertiary" />
          <input
            type="text"
            placeholder="Buscar ações, clientes, OS..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 h-14 bg-transparent text-text-primary placeholder:text-text-tertiary focus:outline-none"
            autoFocus
          />
          <kbd className="hidden sm:flex h-6 items-center gap-1 rounded border border-border bg-surface-secondary px-2 text-xs text-text-tertiary">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-text-secondary">
              Nenhum resultado para &quot;{query}&quot;
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, items]) => {
              if (items.length === 0) return null
              
              return (
                <div key={category} className="mb-2">
                  <div className="px-2 py-1.5 text-xs font-medium text-text-tertiary uppercase tracking-wide">
                    {CATEGORY_LABELS[category]}
                  </div>
                  {items.map((item) => {
                    flatIndex++
                    const isSelected = flatIndex === selectedIndex
                    const currentIndex = flatIndex
                    
                    return (
                      <button
                        key={item.id}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                          isSelected
                            ? 'bg-brand-50 text-brand-600'
                            : 'text-text-primary hover:bg-surface-secondary'
                        )}
                      >
                        <span className={cn(
                          'flex-shrink-0',
                          isSelected ? 'text-brand-500' : 'text-text-tertiary'
                        )}>
                          {item.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{item.label}</div>
                          {item.description && (
                            <div className="text-sm text-text-secondary truncate">
                              {item.description}
                            </div>
                          )}
                        </div>
                        {item.shortcut && (
                          <kbd className="hidden sm:flex h-6 items-center gap-1 rounded border border-border bg-surface-secondary px-2 text-xs text-text-tertiary">
                            {item.shortcut}
                          </kbd>
                        )}
                        {isSelected && (
                          <ArrowRight className="h-4 w-4 text-brand-500" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-surface-secondary text-xs text-text-tertiary">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-white">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-white">↓</kbd>
              para navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-white">↵</kbd>
              para selecionar
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
