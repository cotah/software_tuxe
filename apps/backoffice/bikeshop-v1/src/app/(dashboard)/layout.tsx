'use client'

import { TopBar } from '@/components/layout/top-bar'
import { CommandBar } from '@/components/layout/command-bar'
import { MobileNav } from '@/components/layout/mobile-nav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-surface-secondary">
      <TopBar />
      <CommandBar />
      
      <main className="pb-20 lg:pb-8">
        {children}
      </main>
      
      <MobileNav />
    </div>
  )
}
