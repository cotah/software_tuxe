import Link from 'next/link'
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { AlertItem } from '@/types'
import { cn } from '@/lib/utils'

interface AttentionPanelProps {
  alerts: AlertItem[]
}

function getSeverityConfig(severity: AlertItem['severity']) {
  switch (severity) {
    case 'critical':
      return {
        icon: AlertTriangle,
        iconColor: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-l-red-500',
      }
    case 'warning':
      return {
        icon: AlertCircle,
        iconColor: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-l-amber-500',
      }
    case 'info':
      return {
        icon: Info,
        iconColor: 'text-primary',
        bgColor: 'bg-primary/5',
        borderColor: 'border-l-primary',
      }
  }
}

function sortBySeverity(alerts: AlertItem[]): AlertItem[] {
  const order = { critical: 0, warning: 1, info: 2 }
  return [...alerts].sort((a, b) => order[a.severity] - order[b.severity])
}

export function AttentionPanel({ alerts }: AttentionPanelProps) {
  const sortedAlerts = sortBySeverity(alerts)
  const hasAlerts = sortedAlerts.length > 0

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        Painel de atenção
      </h2>

      <Card>
        <CardContent className="p-0">
          {hasAlerts ? (
            <ul className="divide-y divide-border">
              {sortedAlerts.map((alert) => {
                const config = getSeverityConfig(alert.severity)
                const Icon = config.icon

                return (
                  <li key={alert.id}>
                    <Link
                      href={alert.ctaHref}
                      className={cn(
                        'flex items-center gap-4 p-4 border-l-4 transition-colors hover:bg-muted/50',
                        config.borderColor
                      )}
                    >
                      <div className={cn('p-2 rounded-lg', config.bgColor)}>
                        <Icon className={cn('h-4 w-4', config.iconColor)} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">
                          {alert.message}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {alert.context}
                        </p>
                      </div>

                      <span className="text-sm font-medium text-primary whitespace-nowrap">
                        {alert.ctaLabel}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="flex items-center gap-3 p-6">
              <div className="p-2 rounded-lg bg-emerald-50">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-muted-foreground">Tudo em dia</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
