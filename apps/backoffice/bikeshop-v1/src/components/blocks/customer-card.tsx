'use client'

import { Phone, Mail, Bike, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn, getInitials, formatRelativeTime } from '@/lib/utils'
import type { Customer } from '@/types'

interface CustomerCardProps {
  customer: Customer
  isSelected?: boolean
  hasAlert?: boolean
  onClick?: () => void
}

export function CustomerCard({
  customer,
  isSelected,
  hasAlert,
  onClick,
}: CustomerCardProps) {
  const initials = getInitials(customer.name)
  const mainBike = customer.bikes[0]

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150',
        isSelected
          ? 'bg-brand-50 border border-brand-200'
          : 'hover:bg-surface-secondary border border-transparent'
      )}
    >
      {/* Avatar */}
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarFallback
            className={cn(
              'text-sm',
              isSelected
                ? 'bg-brand-100 text-brand-600'
                : 'bg-gray-100 text-gray-600'
            )}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        {hasAlert && (
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-status-warning border-2 border-white" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-text-primary truncate">
            {customer.name}
          </h3>
          {hasAlert && (
            <AlertCircle className="h-4 w-4 text-status-warning flex-shrink-0" />
          )}
        </div>

        {/* Bike info */}
        {mainBike && (
          <p className="text-sm text-text-secondary truncate">
            {mainBike.brand} {mainBike.model}
          </p>
        )}

        {/* Last visit */}
        {customer.lastVisit && (
          <p className="text-xs text-text-tertiary mt-1">
            Última visita: {formatRelativeTime(customer.lastVisit)}
          </p>
        )}
      </div>
    </div>
  )
}

// Detailed customer card for the detail panel
export function CustomerDetailHeader({ customer }: { customer: Customer }) {
  const initials = getInitials(customer.name)

  return (
    <div className="p-5 border-b border-border">
      {/* Name and avatar */}
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="text-lg bg-brand-100 text-brand-600">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold text-text-primary">
            {customer.name}
          </h2>
          <p className="text-sm text-text-secondary">
            Cliente desde {new Date(customer.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Contact info */}
      <div className="flex flex-wrap gap-4">
        <a
          href={`tel:${customer.phone}`}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-brand-500 transition-colors"
        >
          <Phone className="h-4 w-4" />
          {customer.phone}
        </a>
        {customer.email && (
          <a
            href={`mailto:${customer.email}`}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-brand-500 transition-colors"
          >
            <Mail className="h-4 w-4" />
            {customer.email}
          </a>
        )}
      </div>

      {/* Bikes */}
      {customer.bikes.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {customer.bikes.map((bike) => (
            <Badge key={bike.id} variant="outline" className="flex items-center gap-1">
              <Bike className="h-3 w-3" />
              {bike.brand} {bike.model}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
