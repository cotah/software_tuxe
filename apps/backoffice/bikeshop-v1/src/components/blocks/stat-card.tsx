'use client'

import { cn } from '@/lib/utils'

interface StatCardProps {
  value: number | string
  label: string
  sublabel?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'highlight'
  className?: string
  onClick?: () => void
}

export function StatCard({
  value,
  label,
  sublabel,
  trend,
  variant = 'default',
  className,
  onClick,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl p-5 transition-all duration-150',
        variant === 'default' && 'bg-white border border-border',
        variant === 'highlight' && 'bg-brand-500 text-white',
        onClick && 'cursor-pointer hover:shadow-card',
        className
      )}
    >
      <div
        className={cn(
          'text-3xl font-semibold tracking-tight',
          variant === 'default' ? 'text-text-primary' : 'text-white'
        )}
      >
        {value}
      </div>
      
      <div
        className={cn(
          'text-sm mt-1',
          variant === 'default' ? 'text-text-secondary' : 'text-white/80'
        )}
      >
        {label}
      </div>
      
      {sublabel && (
        <div
          className={cn(
            'text-xs mt-0.5',
            variant === 'default' ? 'text-text-tertiary' : 'text-white/60'
          )}
        >
          {sublabel}
        </div>
      )}

      {/* Progress bar indicator */}
      {variant === 'default' && (
        <div className="mt-3 h-1 w-full rounded-full bg-surface-secondary overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all"
            style={{ width: `${Math.min(Number(value) * 10, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}

// Three-stat row for workshop status
interface WorkshopStatusProps {
  inProgress: number
  waiting: number
  ready: number
  onClickInProgress?: () => void
  onClickWaiting?: () => void
  onClickReady?: () => void
}

export function WorkshopStatus({
  inProgress,
  waiting,
  ready,
  onClickInProgress,
  onClickWaiting,
  onClickReady,
}: WorkshopStatusProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard
        value={inProgress}
        label="Em trabalho"
        onClick={onClickInProgress}
      />
      <StatCard
        value={waiting}
        label="Aguardando"
        sublabel="peça ou aprovação"
        onClick={onClickWaiting}
      />
      <StatCard
        value={ready}
        label="Prontas"
        sublabel="para entrega"
        variant="highlight"
        onClick={onClickReady}
      />
    </div>
  )
}
