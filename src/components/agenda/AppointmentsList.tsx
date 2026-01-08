'use client'

import Link from 'next/link'
import { Clock, User, CheckCircle, Wrench, Phone } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Appointment, AppointmentType, AppointmentStatus } from '@/types'
import { cn } from '@/lib/utils'

function getTypeConfig(type: AppointmentType) {
  switch (type) {
    case 'dropoff':
      return {
        label: 'Recebimento',
        className: 'bg-blue-50 text-blue-700 border-blue-200',
      }
    case 'pickup':
      return {
        label: 'Entrega',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      }
    case 'review':
      return {
        label: 'Revisão',
        className: 'bg-neutral-100 text-neutral-700 border-neutral-200',
      }
    case 'call':
      return {
        label: 'Ligação',
        className: 'bg-amber-50 text-amber-700 border-amber-200',
      }
  }
}

function getStatusConfig(status?: AppointmentStatus) {
  switch (status) {
    case 'confirmed':
      return {
        label: 'Confirmado',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      }
    case 'pending':
      return {
        label: 'Pendente',
        className: 'bg-amber-50 text-amber-700 border-amber-200',
      }
    case 'canceled':
      return {
        label: 'Cancelado',
        className: 'bg-red-50 text-red-700 border-red-200',
      }
    default:
      return null
  }
}

function getTypeIcon(type: AppointmentType) {
  switch (type) {
    case 'dropoff':
    case 'pickup':
      return Wrench
    case 'review':
      return CheckCircle
    case 'call':
      return Phone
  }
}

function formatTimeRange(startAt: string, endAt: string): string {
  const start = new Date(startAt)
  const end = new Date(endAt)
  const startTime = start.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })
  const endTime = end.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })
  return `${startTime} - ${endTime}`
}

interface AppointmentsListProps {
  appointments: Appointment[]
  isLoading: boolean
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const typeConfig = getTypeConfig(appointment.type)
  const statusConfig = getStatusConfig(appointment.status)
  const TypeIcon = getTypeIcon(appointment.type)

  return (
    <Card className="hover:bg-muted/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={cn('p-2 rounded-lg', typeConfig.className.split(' ')[0])}>
            <TypeIcon className={cn('h-4 w-4', typeConfig.className.split(' ')[1])} />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium text-foreground text-sm">
                  {appointment.title}
                </h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeRange(appointment.startAt, appointment.endAt)}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <Badge variant="outline" className={cn('text-xs', typeConfig.className)}>
                  {typeConfig.label}
                </Badge>
                {statusConfig && (
                  <Badge variant="outline" className={cn('text-xs', statusConfig.className)}>
                    {statusConfig.label}
                  </Badge>
                )}
              </div>
            </div>

            {appointment.customerName && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                {appointment.customerName}
              </div>
            )}

            {appointment.notes && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {appointment.notes}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              {appointment.orderId && (
                <Link href={`/orders/${appointment.orderId}`}>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    Ver OS
                  </Button>
                </Link>
              )}
              {appointment.customerId && !appointment.orderId && (
                <Link href={`/customers/${appointment.customerId}`}>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    Ver Cliente
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 bg-muted rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-48" />
                <div className="h-3 bg-muted rounded w-24" />
                <div className="h-3 bg-muted rounded w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          ✓ Sem compromissos hoje
        </p>
      </CardContent>
    </Card>
  )
}

export function AppointmentsList({ appointments, isLoading }: AppointmentsListProps) {
  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  )

  return (
    <div className="space-y-4">
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-lg font-medium">Compromissos</CardTitle>
      </CardHeader>

      {isLoading ? (
        <LoadingSkeleton />
      ) : sortedAppointments.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {sortedAppointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      )}
    </div>
  )
}
