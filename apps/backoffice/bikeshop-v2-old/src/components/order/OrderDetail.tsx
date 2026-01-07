'use client'

import Link from 'next/link'
import { ArrowLeft, User, Bike, Wrench, Clock, CheckCircle, Mail, Phone } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useOrder } from '@/hooks/useDataHooks'
import { OrderStatus } from '@/types'
import { cn } from '@/lib/utils'

interface OrderDetailProps {
  orderId: string
}

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
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function getStatusConfig(status: OrderStatus) {
  switch (status) {
    case 'in_progress':
      return {
        label: 'Em trabalho',
        icon: Wrench,
        className: 'bg-primary/10 text-primary border-primary/20',
      }
    case 'waiting':
      return {
        label: 'Aguardando',
        icon: Clock,
        className: 'bg-muted text-muted-foreground border-muted',
      }
    case 'ready':
      return {
        label: 'Pronta',
        icon: CheckCircle,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      }
  }
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-muted rounded w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-48 bg-muted rounded" />
        <div className="h-48 bg-muted rounded" />
      </div>
      <div className="h-64 bg-muted rounded" />
    </div>
  )
}

export function OrderDetail({ orderId }: OrderDetailProps) {
  const { data: order, isLoading, error } = useOrder(orderId)

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <Link href="/orders">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Ordem de serviço não encontrada
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusConfig = getStatusConfig(order.status)
  const StatusIcon = statusConfig.icon

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/orders">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>

        <Badge variant="outline" className={cn('text-sm px-3 py-1', statusConfig.className)}>
          <StatusIcon className="h-4 w-4 mr-2" />
          {statusConfig.label}
        </Badge>
      </div>

      <div>
        <h1 className="text-3xl font-light tracking-tight text-foreground mb-2">
          OS #{order.id}
        </h1>
        <p className="text-muted-foreground">
          Criada em {formatDate(order.createdAt)} · Previsão: {formatDate(order.promisedAt)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <User className="h-5 w-5 text-muted-foreground" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-lg font-medium">{order.customer.name}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              {order.customer.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              {order.customer.phone}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <Bike className="h-5 w-5 text-muted-foreground" />
              Bicicleta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-lg font-medium">
              {order.bike.brand} {order.bike.model}
            </p>
            <p className="text-sm text-muted-foreground">
              Cor: {order.bike.color}
            </p>
            {order.bike.year && (
              <p className="text-sm text-muted-foreground">
                Ano: {order.bike.year}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <Wrench className="h-5 w-5 text-muted-foreground" />
            Serviços
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ul className="divide-y divide-border">
              {order.services.map((service) => (
                <li key={service.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{service.name}</p>
                    {service.quantity > 1 && (
                      <p className="text-sm text-muted-foreground">
                        Quantidade: {service.quantity}
                      </p>
                    )}
                  </div>
                  <p className="font-medium">
                    {formatCurrency(service.price * service.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <p className="text-lg font-medium">Total</p>
                <p className="text-2xl font-semibold text-primary">
                  {formatCurrency(order.total)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {order.notes && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{order.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
