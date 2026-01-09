'use client'

import type { ReactNode } from 'react'
import {
  FileSpreadsheet,
  FileText,
  UploadCloud,
  Loader2,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { IntegrationCard } from './IntegrationCard'
import { useIntegrationsStore } from '@/store/integrationsStore'
import {
  useConnectIntegration,
  useDisconnectIntegration,
  useIntegrations,
  useSyncIntegration,
} from '@/hooks/useDataHooks'
import type { IntegrationItem, IntegrationProvider } from '@/types'

const providerMeta: Record<
  IntegrationProvider,
  { title: string; description: string; helperText: string; icon: ReactNode; disabled?: boolean }
> = {
  google_sheets: {
    title: 'Google Sheets',
    description: 'Planilhas e bases de clientes em tempo real.',
    helperText: 'Sincroniza nomes, contatos e segmentos.',
    icon: <FileSpreadsheet className="h-5 w-5" />,
  },
  microsoft_excel: {
    title: 'Microsoft Excel / 365',
    description: 'Integre planilhas do OneDrive ou SharePoint.',
    helperText: 'Sincroniza listas e indicadores operacionais.',
    icon: <FileText className="h-5 w-5" />,
  },
  csv: {
    title: 'CSV Upload',
    description: 'Importe arquivos CSV manualmente.',
    helperText: 'Modo de importacao manual (em breve).',
    icon: <UploadCloud className="h-5 w-5" />,
    disabled: true,
  },
}

function mergeIntegrations(data: IntegrationItem[] | undefined): IntegrationItem[] {
  const list = data || []
  return (Object.keys(providerMeta) as IntegrationProvider[]).map((provider) => {
    const existing = list.find((item) => item.provider === provider)
    return (
      existing || {
        provider,
        status: 'disconnected',
      }
    )
  })
}

export function IntegrationsDialog() {
  const { isOpen, close } = useIntegrationsStore()
  const { data, isLoading } = useIntegrations()
  const connectMutation = useConnectIntegration()
  const disconnectMutation = useDisconnectIntegration()
  const syncMutation = useSyncIntegration()

  const integrations = mergeIntegrations(data)

  const handleConnect = (provider: IntegrationProvider) => {
    connectMutation.mutate(provider, {
      onSuccess: (result) => {
        if (result?.authUrl) {
          window.open(result.authUrl, '_blank')
        }
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? close() : undefined)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Integrações de Dados</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando integrações...
          </div>
        ) : (
          <div className="space-y-4">
            {integrations.map((integration) => {
              const meta = providerMeta[integration.provider]
              const isBusy =
                connectMutation.isPending ||
                disconnectMutation.isPending ||
                syncMutation.isPending

              return (
                <IntegrationCard
                  key={integration.provider}
                  title={meta.title}
                  description={meta.description}
                  helperText={meta.helperText}
                  icon={meta.icon}
                  status={integration.status}
                  disabled={meta.disabled}
                  isBusy={isBusy}
                  onConnect={() => handleConnect(integration.provider)}
                  onDisconnect={() => disconnectMutation.mutate(integration.provider)}
                  onSync={() => syncMutation.mutate(integration.provider)}
                />
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
