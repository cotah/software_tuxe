'use client'

import { Mail, Phone, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CustomerDetail, CustomerStatus } from '@/types'
import { cn } from '@/lib/utils'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
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

interface CustomerSummaryCardProps {
  customer: CustomerDetail
}

export function CustomerSummaryCard({ customer }: CustomerSummaryCardProps) {
  const statusConfig = getStatusConfig(customer.status)
  const StatusIcon = statusConfig.icon

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2.5 rounded-lg', statusConfig.className.split(' ')[0])}>
              <StatusIcon className={cn('h-5 w-5', statusConfig.className.split(' ')[1])} />
            </div>
            <div>
              <CardTitle className="text-xl font-medium">{customer.name}</CardTitle>
              <Badge variant="outline" className={cn('mt-1 text-xs', statusConfig.className)}>
                {statusConfig.label}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">{customer.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">{customer.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Cliente desde</span>
            <span className="text-foreground">{formatDate(customer.createdAt)}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total gasto</p>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(customer.totalSpent)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ordens</p>
              <p className="text-lg font-semibold text-foreground">{customer.ordersCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ticket médio</p>
              <p className="text-lg font-semibold text-foreground">
                {customer.ordersCount > 0
                  ? formatCurrency(customer.totalSpent / customer.ordersCount)
                  : formatCurrency(0)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
