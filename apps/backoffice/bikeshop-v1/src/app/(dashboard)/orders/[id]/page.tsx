'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  Bike,
  Send,
  FileText,
  MoreHorizontal,
  Check,
} from 'lucide-react'
import { api } from '@/lib/api'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { OrderProgress } from '@/features/orders/components/order-progress'
import { OrderTimeline } from '@/features/orders/components/order-timeline'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const { data: order, isLoading } = useQuery({
    queryKey: ['orders', orderId],
    queryFn: async () => {
      const res = await api.orders.get(orderId)
      return res.data
    },
  })

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-20 w-full mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6 text-center">
        <h1 className="text-xl font-semibold mb-2">OS não encontrada</h1>
        <p className="text-text-secondary mb-4">
          A ordem de serviço que você procura não existe.
        </p>
        <Button onClick={() => router.push('/orders')}>
          Voltar para Ordens
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/orders')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-heading text-text-primary">
                OS #{order.orderNumber}
              </h1>
              <Badge className={ORDER_STATUS_COLORS[order.status]}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              Criada em {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary">
            <FileText className="h-4 w-4 mr-2" />
            Gerar PDF
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="mb-6">
        <CardContent className="py-6">
          <OrderProgress currentStatus={order.status} />
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Bike */}
          <Card>
            <CardContent className="py-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Customer */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-surface-secondary">
                    <User className="h-5 w-5 text-text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary uppercase tracking-wide">
                      Cliente
                    </p>
                    <p className="font-medium text-text-primary">
                      {order.customerName}
                    </p>
                    <Link
                      href={`/customers?id=${order.customerId}`}
                      className="text-sm text-brand-500 hover:underline"
                    >
                      Ver ficha →
                    </Link>
                  </div>
                </div>

                {/* Bike */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-surface-secondary">
                    <Bike className="h-5 w-5 text-text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary uppercase tracking-wide">
                      Bicicleta
                    </p>
                    <p className="font-medium text-text-primary">
                      {order.bikeName}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Serviços</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {order.services.length === 0 ? (
                <p className="text-sm text-text-secondary py-4">
                  Nenhum serviço adicionado ainda.
                </p>
              ) : (
                <div className="space-y-3">
                  {order.services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-start justify-between p-3 rounded-lg bg-surface-secondary"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          className={cn(
                            'mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                            service.completed
                              ? 'bg-status-success border-status-success text-white'
                              : 'border-gray-300 hover:border-gray-400'
                          )}
                        >
                          {service.completed && <Check className="h-3 w-3" />}
                        </button>
                        <div>
                          <p
                            className={cn(
                              'font-medium',
                              service.completed && 'line-through text-text-secondary'
                            )}
                          >
                            {service.name}
                          </p>
                          {service.partName && (
                            <p className="text-sm text-text-secondary mt-0.5">
                              Peça: {service.partName}
                              {service.partStock && (
                                <Badge
                                  variant={
                                    service.partStock === 'ok'
                                      ? 'success'
                                      : service.partStock === 'low'
                                      ? 'warning'
                                      : 'error'
                                  }
                                  className="ml-2"
                                >
                                  {service.partStock === 'ok'
                                    ? 'Em estoque'
                                    : service.partStock === 'low'
                                    ? 'Baixo'
                                    : 'Zerado'}
                                </Badge>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="font-medium text-text-primary">
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                  ))}

                  {/* Total */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="font-medium text-text-secondary">Total</span>
                    <span className="text-lg font-semibold text-text-primary">
                      {formatCurrency(order.totalValue)}
                    </span>
                  </div>
                </div>
              )}

              <Button variant="secondary" className="w-full mt-4">
                + Adicionar serviço
              </Button>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notas internas</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-text-secondary italic">
                  &quot;{order.notes}&quot;
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Timeline & Actions */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardContent className="py-5 space-y-3">
              {order.status === 'ready' && !order.customerNotified && (
                <Button className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Avisar Cliente
                </Button>
              )}
              
              <div className="flex gap-2">
                <select className="flex-1 h-10 px-3 rounded-lg border border-border bg-white text-sm">
                  <option value="">Mover para...</option>
                  <option value="diagnosing">Em Diagnóstico</option>
                  <option value="in_progress">Em Execução</option>
                  <option value="ready">Pronta</option>
                  <option value="delivered">Entregue</option>
                </select>
                <Button variant="secondary" size="icon">
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Histórico</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {order.timeline.length === 0 ? (
                <p className="text-sm text-text-secondary">
                  Nenhum evento registrado.
                </p>
              ) : (
                <OrderTimeline events={order.timeline} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
