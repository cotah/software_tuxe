'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { IntegrationStatus } from '@/types'

type IntegrationCardProps = {
  title: string
  description: string
  status: IntegrationStatus
  icon: React.ReactNode
  helperText?: string
  disabled?: boolean
  isBusy?: boolean
  onConnect?: () => void
  onDisconnect?: () => void
  onSync?: () => void
}

const statusLabel: Record<IntegrationStatus, string> = {
  connected: 'Conectado',
  disconnected: 'Desconectado',
  error: 'Erro',
}

export function IntegrationCard({
  title,
  description,
  status,
  icon,
  helperText,
  disabled,
  isBusy,
  onConnect,
  onDisconnect,
  onSync,
}: IntegrationCardProps) {
  return (
    <Card className={cn(disabled && 'opacity-60')}>
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              status === 'connected' && 'border-emerald-200 bg-emerald-50 text-emerald-700',
              status === 'error' && 'border-red-200 bg-red-50 text-red-700'
            )}
          >
            {statusLabel[status]}
          </Badge>
        </div>

        {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}

        <div className="flex flex-wrap gap-2">
          {status === 'connected' ? (
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={disabled || isBusy}
                onClick={onSync}
              >
                Sincronizar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={disabled || isBusy}
                onClick={onDisconnect}
              >
                Desconectar
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled={disabled || isBusy}
              onClick={onConnect}
            >
              {disabled ? 'Em breve' : 'Conectar'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
