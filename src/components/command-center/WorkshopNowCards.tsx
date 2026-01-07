import Link from 'next/link'
import { Wrench, Clock, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface WorkshopStats {
  inProgress: number
  waiting: number
  ready: number
  readyTotal: number
}

interface WorkshopNowCardsProps {
  stats: WorkshopStats
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function WorkshopNowCards({ stats }: WorkshopNowCardsProps) {
  const total = stats.inProgress + stats.waiting + stats.ready

  const cards = [
    {
      label: 'Em trabalho',
      count: stats.inProgress,
      icon: Wrench,
      href: '/orders',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Aguardando',
      count: stats.waiting,
      icon: Clock,
      href: '/orders',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
    {
      label: 'Prontas',
      count: stats.ready,
      icon: CheckCircle,
      href: '/orders',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      extra: stats.readyTotal > 0 ? formatCurrency(stats.readyTotal) : undefined,
    },
  ]

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        Oficina agora
      </h2>

      <div className="grid grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          const proportion = total > 0 ? (card.count / total) * 100 : 0

          return (
            <Link key={card.label} href={card.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={cn('p-2 rounded-lg', card.bgColor)}>
                      <Icon className={cn('h-5 w-5', card.color)} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-4xl font-light tracking-tight">
                      {card.count}
                    </p>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    {card.extra && (
                      <p className="text-sm font-medium text-emerald-600">
                        {card.extra}
                      </p>
                    )}
                  </div>

                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        card.label === 'Em trabalho' && 'bg-primary',
                        card.label === 'Aguardando' && 'bg-muted-foreground/50',
                        card.label === 'Prontas' && 'bg-emerald-500'
                      )}
                      style={{ width: `${proportion}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
