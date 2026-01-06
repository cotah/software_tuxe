'use client'

import Link from 'next/link'
import { Calendar, Truck, MessageCircle, Clock } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TimelineEvent } from '@/types'
import { cn } from '@/lib/utils'

interface DayTimelineProps {
  events: TimelineEvent[]
}

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]

function getEventIcon(type: TimelineEvent['type']) {
  switch (type) {
    case 'delivery':
      return Truck
    case 'appointment':
      return Calendar
    case 'followup':
      return MessageCircle
    case 'deadline':
      return Clock
  }
}

function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours + minutes / 60
}

function getCurrentHour(): number {
  const now = new Date()
  return now.getHours() + now.getMinutes() / 60
}

function getEventPosition(time: string): number {
  const eventHour = parseTime(time)
  const startHour = 8
  const endHour = 18
  return ((eventHour - startHour) / (endHour - startHour)) * 100
}

export function DayTimeline({ events }: DayTimelineProps) {
  const currentHour = getCurrentHour()
  const currentPosition = ((currentHour - 8) / (18 - 8)) * 100

  const isWithinBusinessHours = currentHour >= 8 && currentHour <= 18

  return (
    <TooltipProvider>
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Linha do tempo
        </h2>

        <div className="relative">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            {HOURS.map((hour) => (
              <span key={hour} className="w-8 text-center">
                {hour}h
              </span>
            ))}
          </div>

          <div className="relative h-16 bg-muted/30 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex">
              {HOURS.slice(0, -1).map((hour) => {
                const isPast = currentHour > hour + 1
                return (
                  <div
                    key={hour}
                    className={cn(
                      'flex-1 border-r border-border/50',
                      isPast && 'bg-muted/50'
                    )}
                  />
                )
              })}
            </div>

            {isWithinBusinessHours && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-primary z-20"
                style={{ left: `${Math.min(Math.max(currentPosition, 0), 100)}%` }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] font-medium rounded">
                  AGORA
                </div>
              </div>
            )}

            {events.map((event) => {
              const position = getEventPosition(event.time)
              const eventHour = parseTime(event.time)
              const isPast = eventHour < currentHour
              const Icon = getEventIcon(event.type)

              return (
                <Tooltip key={event.id}>
                  <TooltipTrigger asChild>
                    <Link
                      href={event.href}
                      className={cn(
                        'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10',
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        'transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                        isPast && 'bg-muted text-muted-foreground',
                        !isPast && !event.severity && 'bg-background border-2 border-primary text-primary',
                        event.severity === 'warning' && 'bg-amber-100 border-2 border-amber-500 text-amber-700'
                      )}
                      style={{ left: `${position}%` }}
                    >
                      <Icon className="h-4 w-4" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{event.time} - {event.label}</p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </div>
      </section>
    </TooltipProvider>
  )
}
