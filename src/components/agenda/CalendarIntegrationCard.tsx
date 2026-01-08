'use client'

import {
  Calendar,
  Link2,
  Unlink,
  RefreshCw,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  useCalendarConnection,
  useConnectCalendar,
  useDisconnectCalendar,
  useSyncCalendar,
} from '@/hooks/useDataHooks'
import { CalendarProvider } from '@/types'

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))

  if (diffMins < 1) return 'agora mesmo'
  if (diffMins < 60) return `há ${diffMins} min`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `há ${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  return `há ${diffDays} dias`
}

function getProviderLabel(provider: CalendarProvider): string {
  switch (provider) {
    case 'google':
      return 'Google Calendar'
    case 'outlook':
      return 'Outlook Calendar'
    case 'calendly':
      return 'Calendly'
    default:
      return 'Calendário'
  }
}

export function CalendarIntegrationCard() {
  const { data: connection, isLoading } = useCalendarConnection()
  const connectMutation = useConnectCalendar()
  const disconnectMutation = useDisconnectCalendar()
  const syncMutation = useSyncCalendar()

  const isConnecting = connectMutation.isPending
  const isDisconnecting = disconnectMutation.isPending
  const isSyncing = syncMutation.isPending
  const isBusy = isConnecting || isDisconnecting || isSyncing

  const handleConnect = (provider: CalendarProvider) => {
    connectMutation.mutate(provider)
  }

  const handleDisconnect = () => {
    disconnectMutation.mutate()
  }

  const handleSync = () => {
    syncMutation.mutate()
  }

  const handleReconnect = () => {
    if (connection?.provider && connection.provider !== 'native') {
      connectMutation.mutate(connection.provider)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            Integrações de Calendário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-64" />
            <div className="flex gap-2">
              <div className="h-9 bg-muted rounded w-32" />
              <div className="h-9 bg-muted rounded w-32" />
              <div className="h-9 bg-muted rounded w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const status = connection?.status || 'disconnected'

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          Integrações de Calendário
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Conecte sua agenda para sincronizar entregas e agendamentos.
        </p>

        {status === 'disconnected' && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConnect('google')}
                disabled={isBusy}
                className="gap-2"
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Link2 className="h-4 w-4" />
                )}
                Conectar Google
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConnect('outlook')}
                disabled={isBusy}
                className="gap-2"
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Link2 className="h-4 w-4" />
                )}
                Conectar Outlook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConnect('calendly')}
                disabled={isBusy}
                className="gap-2"
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Link2 className="h-4 w-4" />
                )}
                Conectar Calendly
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Você poderá desconectar quando quiser.
            </p>
          </div>
        )}

        {(status === 'connecting' || (status === 'disconnected' && isConnecting)) && (
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Conectando...</span>
          </div>
        )}

        {status === 'connected' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {getProviderLabel(connection?.provider || 'native')}
                </p>
                {connection?.accountLabel && (
                  <p className="text-xs text-muted-foreground">
                    {connection.accountLabel}
                  </p>
                )}
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                Conectado
              </Badge>
            </div>

            {connection?.lastSyncedAt && (
              <p className="text-xs text-muted-foreground">
                Última sincronização: {formatRelativeTime(connection.lastSyncedAt)}
              </p>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={isBusy}
                className="gap-2"
              >
                {isSyncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Sincronizar agora
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                disabled={isBusy}
                className="gap-2 text-muted-foreground"
              >
                {isDisconnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Unlink className="h-4 w-4" />
                )}
                Desconectar
              </Button>
            </div>
          </div>
        )}

        {status === 'syncing' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Sincronizando...</p>
                <p className="text-xs text-muted-foreground">
                  {getProviderLabel(connection?.provider || 'native')}
                </p>
              </div>
            </div>
          </div>
        )}

        {status === 'needs_reauth' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {getProviderLabel(connection?.provider || 'native')}
                </p>
                {connection?.accountLabel && (
                  <p className="text-xs text-muted-foreground">
                    {connection.accountLabel}
                  </p>
                )}
              </div>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Reautenticação necessária
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleReconnect}
                disabled={isBusy}
                className="gap-2"
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Link2 className="h-4 w-4" />
                )}
                Reconectar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                disabled={isBusy}
                className="gap-2 text-muted-foreground"
              >
                Desconectar
              </Button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {getProviderLabel(connection?.provider || 'native')}
                </p>
                {connection?.errorMessage && (
                  <p className="text-xs text-red-600">{connection.errorMessage}</p>
                )}
              </div>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Erro
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleReconnect}
                disabled={isBusy}
                className="gap-2"
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Tentar novamente
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                disabled={isBusy}
                className="gap-2 text-muted-foreground"
              >
                Desconectar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
