'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogClose,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export type MobileNavItem = {
  href: string
  label: string
  icon: ReactNode
}

type MobileNavDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: MobileNavItem[]
}

export function MobileNavDrawer({ open, onOpenChange, items }: MobileNavDrawerProps) {
  const pathname = usePathname()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="left-0 top-0 h-full w-[280px] max-w-[85vw] translate-x-0 translate-y-0 rounded-none border-r p-6">
        <div className="space-y-6">
          <div className="space-y-1">
            <Link href="/dashboard" className="text-sm font-semibold tracking-[0.2em] text-foreground">
              BTRIX
            </Link>
            <p className="text-xs text-muted-foreground">Navegacao principal</p>
          </div>

          <nav className="space-y-2">
            {items.map((item) => {
              const isActive = item.href === '/dashboard'
                ? pathname === '/dashboard' || pathname.startsWith('/dashboard/')
                : pathname.startsWith(item.href)

              return (
                <DialogClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-foreground">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                </DialogClose>
              )
            })}
          </nav>
        </div>
      </DialogContent>
    </Dialog>
  )
}
