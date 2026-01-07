'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Calendar, Home, Package, Search, Users, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useCommandBarStore } from '@/store/commandBarStore'
import { NavIcon } from './NavIcon'

const navItems = [
  { href: '/dashboard', label: 'Command Center', icon: <Home className="h-5 w-5" /> },
  { href: '/customers', label: 'Customers', icon: <Users className="h-5 w-5" /> },
  { href: '/orders', label: 'Orders', icon: <Wrench className="h-5 w-5" /> },
  { href: '/agenda', label: 'Agenda', icon: <Calendar className="h-5 w-5" /> },
  { href: '/inventory', label: 'Inventory', icon: <Package className="h-5 w-5" /> },
]

function useOutsideClose(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  return ref
}

function AvatarMenu() {
  const [open, setOpen] = useState(false)
  const menuRef = useOutsideClose(open, () => setOpen(false))

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-sm font-medium text-foreground shadow-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        BR
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-44 rounded-lg border border-border bg-popover p-1 text-sm shadow-lg"
        >
          <Link
            href="/settings"
            role="menuitem"
            className="flex w-full items-center rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => setOpen(false)}
          >
            Minha conta
          </Link>
          <Link
            href="/settings"
            role="menuitem"
            className="flex w-full items-center rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => setOpen(false)}
          >
            Configuracoes
          </Link>
          <Link
            href="/logout"
            role="menuitem"
            className="flex w-full items-center rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => setOpen(false)}
          >
            Sair
          </Link>
        </div>
      )}
    </div>
  )
}

export function TopBar() {
  const pathname = usePathname()
  const { open: openCommandBar } = useCommandBarStore()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname.startsWith('/dashboard/')
    return pathname.startsWith(href)
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-semibold tracking-[0.2em] text-foreground">
            BTRIX
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavIcon key={item.href} href={item.href} label={item.label} icon={item.icon} active={isActive(item.href)} />
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openCommandBar}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Comando</span>
            <span className="rounded border border-border px-1.5 text-xs text-muted-foreground">Ctrl+K</span>
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span>Notificacoes</span>
            </TooltipContent>
          </Tooltip>

          <AvatarMenu />
        </div>
      </div>
    </header>
  )
}
