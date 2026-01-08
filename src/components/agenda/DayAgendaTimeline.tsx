'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Appointment, AppointmentType } from '@/types'
import { cn } from '@/lib/utils'

const HOUR_HEIGHT = 60
const START_HOUR = 8
const END_HOUR = 18
const TOTAL_HOURS = END_HOUR - START_HOUR

function getTypeColor(type: AppointmentType): string {
  switch (type) {
    case 'dropoff':
      return 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200'
    case 'pickup':
      return 'bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-emerald-200'
    case 'review':
      return 'bg-neutral-100 border-neutral-300 text-neutral-800 hover:bg-neutral-200'
    case 'call':
      return 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200'
  }
}

function getTypeLabel(type: AppointmentType): string {
  switch (type) {
    case 'dropoff':
      return 'Recebimento'
    case 'pickup':
      return 'Entrega'
    case 'review':
      return 'Revisão'
    case 'call':
      return 'Ligação'
  }
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })
}

function getPositionFromTime(dateString: string): number {
  const date = new Date(dateString)
  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()
  const totalMinutes = (hours - START_HOUR) * 60 + minutes
  return (totalMinutes / 60) * HOUR_HEIGHT
}

function getDurationHeight(startAt: string, endAt: string): number {
  const start = new Date(startAt)
  const end = new Date(endAt)
  const durationMs = end.getTime() - start.getTime()
  const durationMinutes = durationMs / (1000 * 60)
  return Math.max((durationMinutes / 60) * HOUR_HEIGHT, 24)
}

function getCurrentTimePosition(): number {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()

  if (hours < START_HOUR || hours >= END_HOUR) {
    return hours < START_HOUR ? 0 : TOTAL_HOURS * HOUR_HEIGHT
  }

  const totalMinutes = (hours - START_HOUR) * 60 + minutes
  return (totalMinutes / 60) * HOUR_HEIGHT
}

function formatCurrentTime(): string {
  const now = new Date()
  return now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface DayAgendaTimelineProps {
  appointments: Appointment[]
  isLoading: boolean
}

export function DayAgendaTimeline({ appointments, isLoading }: DayAgendaTimelineProps) {
  const router = useRouter()
  const [nowPosition, setNowPosition] = useState(getCurrentTimePosition)
  const [nowLabel, setNowLabel] = useState(formatCurrentTime)

  useEffect(() => {
    const updateTime = () => {
      setNowPosition(getCurrentTimePosition())
      setNowLabel(formatCurrentTime())
    }

    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleAppointmentClick = (appointment: Appointment) => {
    if (appointment.orderId) {
      router.push(`/orders/${appointment.orderId}`)
    } else if (appointment.customerId) {
      router.push(`/customers/${appointment.customerId}`)
    }
  }

  const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i)

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium">Timeline do Dia</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="animate-pulse p-6">
            <div className="h-[600px] bg-muted rounded" />
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <div
              className="relative min-w-[280px]"
              style={{ height: TOTAL_HOURS * HOUR_HEIGHT + 40 }}
            >
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 flex items-start border-t border-border"
                  style={{ top: (hour - START_HOUR) * HOUR_HEIGHT }}
                >
                  <span className="w-14 px-3 py-1 text-xs text-muted-foreground font-medium">
                    {hour.toString().padStart(2, '0')}:00
                  </span>
                  <div className="flex-1" />
                </div>
              ))}

              <div
                className="absolute left-14 right-3 flex items-center z-20 pointer-events-none"
                style={{ top: nowPosition }}
              >
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="flex-1 h-[2px] bg-red-500" />
                <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-red-500 text-white rounded">
                  AGORA {nowLabel}
                </span>
              </div>

              <div className="absolute left-14 right-3 top-0 bottom-0">
                {appointments.map((appointment) => {
                  const top = getPositionFromTime(appointment.startAt)
                  const height = getDurationHeight(appointment.startAt, appointment.endAt)
                  const isClickable = !!appointment.orderId || !!appointment.customerId

                  return (
                    <Tooltip key={appointment.id}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => handleAppointmentClick(appointment)}
                          disabled={!isClickable}
                          className={cn(
                            'absolute left-0 right-0 mx-1 px-2 py-1 rounded border text-left transition-colors',
                            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                            getTypeColor(appointment.type),
                            isClickable ? 'cursor-pointer' : 'cursor-default'
                          )}
                          style={{ top, height }}
                          aria-label={`${appointment.title} - ${formatTime(appointment.startAt)} até ${formatTime(appointment.endAt)}`}
                        >
                          <p className="text-xs font-medium truncate leading-tight">
                            {appointment.title}
                          </p>
                          {height > 30 && (
                            <p className="text-[10px] opacity-75 truncate">
                              {formatTime(appointment.startAt)} - {formatTime(appointment.endAt)}
                            </p>
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <div className="space-y-1">
                          <p className="font-medium">{appointment.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(appointment.startAt)} - {formatTime(appointment.endAt)}
                          </p>
                          <p className="text-xs">
                            Tipo: {getTypeLabel(appointment.type)}
                          </p>
                          {appointment.customerName && (
                            <p className="text-xs">Cliente: {appointment.customerName}</p>
                          )}
                          {appointment.notes && (
                            <p className="text-xs text-muted-foreground">{appointment.notes}</p>
                          )}
                          {isClickable && (
                            <p className="text-xs text-primary mt-2">
                              Clique para ver {appointment.orderId ? 'OS' : 'cliente'}
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
