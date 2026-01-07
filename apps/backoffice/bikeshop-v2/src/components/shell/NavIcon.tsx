'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type NavIconProps = {
  href: string
  label: string
  active?: boolean
  icon: ReactNode
}

export function NavIcon({ href, label, active, icon }: NavIconProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          aria-current={active ? 'page' : undefined}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            active
              ? 'bg-primary/10 text-primary'
              : 'hover:bg-muted hover:text-foreground'
          )}
        >
          {icon}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <span>{label}</span>
      </TooltipContent>
    </Tooltip>
  )
}
