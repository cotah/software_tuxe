'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/types'

interface OrderProgressProps {
  currentStatus: OrderStatus
}

const PROGRESS_STEPS: OrderStatus[] = [
  'received',
  'diagnosing',
  'in_progress',
  'ready',
  'delivered',
]

export function OrderProgress({ currentStatus }: OrderProgressProps) {
  const currentIndex = PROGRESS_STEPS.indexOf(currentStatus)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {PROGRESS_STEPS.map((step, index) => {
          const isPast = index < currentIndex
          const isCurrent = index === currentIndex
          const isFuture = index > currentIndex

          return (
            <div key={step} className="flex-1 relative">
              {/* Line */}
              {index > 0 && (
                <div
                  className={cn(
                    'absolute top-4 right-1/2 w-full h-0.5',
                    isPast || isCurrent ? 'bg-brand-500' : 'bg-gray-200'
                  )}
                  style={{ transform: 'translateX(-50%)' }}
                />
              )}

              {/* Node */}
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
                    isPast && 'bg-brand-500 border-brand-500 text-white',
                    isCurrent &&
                      'bg-white border-brand-500 text-brand-500 ring-4 ring-brand-100',
                    isFuture && 'bg-white border-gray-200 text-gray-400'
                  )}
                >
                  {isPast ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs mt-2 text-center',
                    isCurrent ? 'text-brand-600 font-medium' : 'text-text-secondary'
                  )}
                >
                  {ORDER_STATUS_LABELS[step]}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
