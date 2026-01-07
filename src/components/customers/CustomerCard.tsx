'use client'

import { Mail, ChevronRight, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CustomerListItem, CustomerStatus } from '@/types'
import { cn } from '@/lib/utils'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'hoje'
  if (diffDays === 1) return 'há 1 dia'
  if (diffDays < 7) return `há ${diffDays} dias`
  if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semanas`
  if (diffDays < 365) return `há ${Math.floor(diffDays / 30)} meses`
  return `há ${Math.floor(diffDays / 365)} anos`
}

function getStatusConfig(status: CustomerStatus) {
  switch (status) {
    case 'active':
      return {
        label: 'Ativo',
        icon: CheckCircle,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      }
    case 'waiting':
      return {
        label: 'Aguardando resposta',
        icon: Clock,
        className: 'bg-amber-50 text-amber-700 border-amber-200',
      }
    case 'inactive':
      return {
        label: 'Inativo',
        icon: AlertCircle,
        className: 'bg-gray-100 text-gray-500 border-gray-200',
      }
  }
}

interface CustomerCardProps {
  customer: CustomerListItem
}

export function CustomerCard({ customer }: CustomerCardProps) {
  const statusConfig = getStatusConfig(customer.status)
  const StatusIcon = statusConfig.icon

  return (
    <Card className="hover:bg-muted/30 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', statusConfig.className.split(' ')[0])}>
                <StatusIcon className={cn('h-4 w-4', statusConfig.className.split(' ')[1])} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-foreground">{customer.name}</h3>
                  <Badge variant="outline" className={cn('text-xs', statusConfig.className)}>
                    {statusConfig.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{customer.email}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Última OS: </span>
                <span className="text-foreground">{formatRelativeDate(customer.lastOrderAt)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total: </span>
                <span className="font-medium text-foreground">{formatCurrency(customer.totalSpent)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Ordens: </span>
                <span className="text-foreground">{customer.ordersCount}</span>
              </div>
            </div>
          </div>

          <Button variant="ghost" size="sm" className="text-muted-foreground" disabled>
            Ver perfil
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
