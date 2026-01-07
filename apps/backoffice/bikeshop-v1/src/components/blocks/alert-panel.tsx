'use client'

import Link from 'next/link'
import { AlertTriangle, AlertCircle, Lightbulb, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Alert, AlertSeverity } from '@/types'

interface AlertPanelProps {
  alerts: Alert[]
  maxItems?: number
}

export function AlertPanel({ alerts, maxItems = 5 }: AlertPanelProps) {
  const displayedAlerts = alerts.slice(0, maxItems)
  const hasMore = alerts.length > maxItems

  const getAlertLink = (alert: Alert) => {
    switch (alert.entityType) {
      case 'order':
        return `/orders/${alert.entityId}`
      case 'customer':
        return `/customers?id=${alert.entityId}`
      case 'inventory':
        return `/inventory?id=${alert.entityId}`
      default:
        return '#'
    }
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-status-success-bg mb-3">
            <Lightbulb className="h-6 w-6 text-status-success" />
          </div>
          <p className="text-text-secondary">
            Tudo certo por aqui! Nenhuma pendência no momento.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-status-warning" />
          Atenção
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          {displayedAlerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} href={getAlertLink(alert)} />
          ))}
        </div>
        {hasMore && (
          <button className="mt-3 text-sm text-brand-500 hover:text-brand-600 font-medium">
            Ver todos ({alerts.length})
          </button>
        )}
      </CardContent>
    </Card>
  )
}

function AlertItem({ alert, href }: { alert: Alert; href: string }) {
  const severityConfig: Record<AlertSeverity, { icon: typeof AlertTriangle; color: string; bg: string }> = {
    warning: {
      icon: AlertTriangle,
      color: 'text-status-warning',
      bg: 'bg-status-warning-bg',
    },
    error: {
      icon: AlertCircle,
      color: 'text-status-error',
      bg: 'bg-status-error-bg',
    },
    info: {
      icon: Lightbulb,
      color: 'text-status-info',
      bg: 'bg-status-info-bg',
    },
  }

  const config = severityConfig[alert.severity]
  const Icon = config.icon

  return (
    <Link
      href={href}
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg transition-colors',
        'hover:bg-surface-secondary group'
      )}
    >
      <span className={cn('p-1.5 rounded-md', config.bg)}>
        <Icon className={cn('h-4 w-4', config.color)} />
      </span>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">{alert.title}</p>
        <p className="text-xs text-text-secondary mt-0.5">{alert.description}</p>
      </div>

      <ArrowRight className="h-4 w-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
    </Link>
  )
}
