import type { ReactNode } from 'react'
import { TopBar } from '@/components/shell/TopBar'
import { CommandBar } from '@/components/shell/CommandBar'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <TopBar />
      <div className="pt-20 pb-12">{children}</div>
      <CommandBar />
    </div>
  )
}
