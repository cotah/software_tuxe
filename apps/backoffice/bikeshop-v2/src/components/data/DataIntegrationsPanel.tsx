'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { IntegrationsDialog } from '@/components/integrations/IntegrationsDialog'
import { useIntegrationsStore } from '@/store/integrationsStore'
import { useIntegrations } from '@/hooks/useDataHooks'

function formatDate(date?: string) {
  if (!date) return 'Sem sincronizacao'
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function DataIntegrationsPanel() {
  const { open } = useIntegrationsStore()
  const { data } = useIntegrations()

  const { lastSyncAt, nextSyncAt } = useMemo(() => {
    const last = data
      ?.filter((item) => item.status === 'connected' && item.lastSyncAt)
      .sort((a, b) => (a.lastSyncAt || '').localeCompare(b.lastSyncAt || ''))
      .pop()

    const lastDate = last?.lastSyncAt ? new Date(last.lastSyncAt) : null
    const nextDate = lastDate ? new Date(lastDate.getTime() + 6 * 60 * 60 * 1000) : null

    return {
      lastSyncAt: lastDate?.toISOString(),
      nextSyncAt: nextDate?.toISOString(),
    }
  }, [data])

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Integrações de Dados</h2>
          <p className="text-sm text-muted-foreground">
            Conecte fontes de dados para enriquecer relatórios e clientes.
          </p>
        </div>
        <Button onClick={open}>Conectar fonte de dados</Button>
      </div>

      <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
        <div>
          <span className="text-foreground">Ultima sincronizacao:</span>{' '}
          {formatDate(lastSyncAt)}
        </div>
        <div>
          <span className="text-foreground">Proxima sincronizacao:</span>{' '}
          {formatDate(nextSyncAt)}
        </div>
      </div>

      <IntegrationsDialog />
    </section>
  )
}
