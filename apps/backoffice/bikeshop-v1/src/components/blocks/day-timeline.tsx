'use client'

import { Wrench, Truck, Calendar, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TimelineEvent } from '@/types'

interface DayTimelineProps {
  events: TimelineEvent[]
}

export function DayTimeline({ events }: DayTimelineProps) {
  const hours = ['08h', '09h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h']
  
  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'order':
        return Wrench
      case 'delivery':
        return Truck
      case 'appointment':
        return Calendar
      case 'followup':
        return Phone
      default:
        return Wrench
    }
  }

  const getEventPosition = (time: string) => {
    const [hour] = time.split(':').map(Number)
    // Map 8-18 to 0-100%
    return ((hour - 8) / 10) * 100
  }

  return (
    <div className="relative">
      {/* Time labels */}
      <div className="flex justify-between text-xs text-text-tertiary mb-2 px-1">
        {hours.map((hour) => (
          <span key={hour}>{hour}</span>
        ))}
      </div>

      {/* Timeline track */}
      <div className="relative h-16 bg-surface-secondary rounded-xl overflow-hidden">
        {/* Current time indicator */}
        <CurrentTimeIndicator />

        {/* Event nodes */}
        <div className="absolute inset-0 flex items-center px-2">
          {events.map((event, index) => {
            const Icon = getEventIcon(event.type)
            const left = getEventPosition(event.time)
            
            return (
              <div
                key={event.id}
                className="absolute transform -translate-x-1/2 group cursor-pointer"
                style={{ left: `${left}%` }}
              >
                {/* Node */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                    'border-2 border-white shadow-sm',
                    event.status === 'past' && 'bg-gray-200 text-gray-500',
                    event.status === 'current' && 'bg-brand-500 text-white ring-4 ring-brand-100',
                    event.status === 'upcoming' && 'bg-white text-text-secondary border-gray-200',
                    event.hasWarning && 'ring-2 ring-status-warning'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>

                {/* Tooltip */}
                <div className={cn(
                  'absolute bottom-full mb-2 left-1/2 -translate-x-1/2',
                  'bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap',
                  'opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none',
                  'shadow-lg'
                )}>
                  <div className="font-medium">{event.title}</div>
                  {event.subtitle && (
                    <div className="text-gray-300">{event.subtitle}</div>
                  )}
                  <div className="text-gray-400 mt-0.5">{event.time}</div>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                    <div className="border-4 border-transparent border-t-gray-900" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function CurrentTimeIndicator() {
  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()
  
  // Only show if within business hours (8-18)
  if (hour < 8 || hour >= 18) return null
  
  const position = ((hour - 8 + minute / 60) / 10) * 100

  return (
    <div
      className="absolute top-0 bottom-0 w-0.5 bg-brand-500 z-10"
      style={{ left: `${position}%` }}
    >
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-brand-500" />
    </div>
  )
}

// Compact version for small spaces
export function DayTimelineCompact({ events }: DayTimelineProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2">
      {events.map((event, index) => {
        const Icon = event.type === 'delivery' ? Truck : event.type === 'appointment' ? Calendar : Wrench
        
        return (
          <div
            key={event.id}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap',
              'border border-border bg-white',
              event.status === 'current' && 'border-brand-500 bg-brand-50',
              event.hasWarning && 'border-status-warning'
            )}
          >
            <Icon className={cn(
              'h-4 w-4',
              event.status === 'past' ? 'text-text-tertiary' :
              event.status === 'current' ? 'text-brand-500' :
              'text-text-secondary'
            )} />
            <div>
              <span className="text-xs font-medium text-text-primary">{event.time}</span>
              <span className="text-xs text-text-secondary ml-1">{event.title}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
