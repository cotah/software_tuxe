'use client'

import { Circle, CheckCircle, MessageCircle, RefreshCw, FileText } from 'lucide-react'
import { cn, formatDate, formatTime } from '@/lib/utils'
import type { OrderEvent } from '@/types'

interface OrderTimelineProps {
  events: OrderEvent[]
}

export function OrderTimeline({ events }: OrderTimelineProps) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  const getEventIcon = (type: OrderEvent['type']) => {
    switch (type) {
      case 'created':
        return Circle
      case 'status_changed':
        return RefreshCw
      case 'note_added':
        return FileText
      case 'customer_notified':
        return MessageCircle
      case 'service_completed':
        return CheckCircle
      default:
        return Circle
    }
  }

  return (
    <div className="relative">
      {sortedEvents.map((event, index) => {
        const Icon = getEventIcon(event.type)
        const isLast = index === sortedEvents.length - 1
        const date = new Date(event.createdAt)

        return (
          <div key={event.id} className="flex gap-4 pb-4">
            {/* Timeline line and dot */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  isLast
                    ? 'bg-brand-100 text-brand-600'
                    : 'bg-gray-100 text-gray-500'
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
              )}
            </div>

            {/* Event content */}
            <div className="flex-1 pb-2">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-text-tertiary">
                  {formatDate(date)} às {formatTime(date)}
                </span>
              </div>
              <p className="text-sm text-text-primary mt-0.5">
                {event.description}
              </p>
              {event.createdBy && (
                <span className="text-xs text-text-tertiary">
                  por {event.createdBy}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
