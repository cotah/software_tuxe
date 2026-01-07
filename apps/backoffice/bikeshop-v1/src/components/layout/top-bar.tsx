'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  Wrench,
  Calendar,
  Package,
  Search,
  Bell,
  Settings,
  Menu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useUIStore } from '@/stores/ui-store'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', icon: LayoutDashboard, label: 'Command Center', shortcut: '⌘1' },
  { href: '/customers', icon: Users, label: 'Clientes', shortcut: '⌘2' },
  { href: '/orders', icon: Wrench, label: 'Ordens de Serviço', shortcut: '⌘3' },
  { href: '/calendar', icon: Calendar, label: 'Agenda', shortcut: '⌘4' },
  { href: '/inventory', icon: Package, label: 'Estoque', shortcut: '⌘5' },
]

export function TopBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { openCommandBar, toggleSidebar, toggleNotificationsPanel } = useUIStore()

  return (
    <TooltipProvider delayDuration={100}>
      <header className="sticky top-0 z-40 h-16 bg-white border-b border-border">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between">
          {/* Left: Logo + Mobile Menu */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="font-semibold text-lg text-text-primary hidden sm:block">
                BTRIX
              </span>
            </Link>
          </div>

          {/* Center: Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href))
              
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link href={item.href}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          'relative',
                          isActive && 'bg-surface-secondary text-brand-500'
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {isActive && (
                          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-500" />
                        )}
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <span>{item.label}</span>
                    <span className="ml-2 text-gray-400">{item.shortcut}</span>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </nav>

          {/* Right: Search + Notifications + Settings + Avatar */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={openCommandBar}
                  className="hidden sm:flex"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <span>Buscar</span>
                <span className="ml-2 text-gray-400">⌘K</span>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={toggleNotificationsPanel}
                >
                  <Bell className="h-5 w-5" />
                  {/* Notification badge */}
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-status-error" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Notificações</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/settings">
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">Configurações</TooltipContent>
            </Tooltip>

            <div className="h-6 w-px bg-border mx-1" />

            <button className="flex items-center gap-2 hover:bg-surface-secondary rounded-lg p-1.5 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-brand-100 text-brand-600 text-sm">
                  CA
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-text-primary hidden sm:block">
                Carlos
              </span>
            </button>
          </div>
        </div>
      </header>
    </TooltipProvider>
  )
}
