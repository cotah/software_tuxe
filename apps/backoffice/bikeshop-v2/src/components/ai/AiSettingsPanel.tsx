'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAiSettings, useSaveAiSettings } from '@/hooks/useDataHooks'
import type { AiProvider, AiSettingsPayload, AiStylePreset } from '@/types'
import { cn } from '@/lib/utils'

const providerModels: Record<AiProvider, string[]> = {
  openai: ['gpt-4.1-mini', 'gpt-4o-mini'],
  anthropic: ['claude-3-haiku'],
  google: ['gemini-1.5-flash'],
}

const styleOptions: { value: AiStylePreset; label: string }[] = [
  { value: 'calm', label: 'Calmo' },
  { value: 'direct', label: 'Direto' },
  { value: 'coach', label: 'Coach' },
]

export function AiSettingsPanel() {
  const { data: settings, isLoading } = useAiSettings()
  const saveMutation = useSaveAiSettings()

  const [provider, setProvider] = useState<AiProvider>('openai')
  const [model, setModel] = useState('gpt-4.1-mini')
  const [temperature, setTemperature] = useState(0.2)
  const [style, setStyle] = useState<AiStylePreset>('calm')
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    if (!settings) return
    setProvider(settings.provider || 'openai')
    setModel(settings.model || 'gpt-4.1-mini')
    setTemperature(typeof settings.temperature === 'number' ? settings.temperature : 0.2)
    setStyle(settings.style || 'calm')
    setEnabled(settings.enabled ?? true)
  }, [settings])

  const availableModels = useMemo(() => providerModels[provider], [provider])

  useEffect(() => {
    if (!availableModels.includes(model)) {
      setModel(availableModels[0])
    }
  }, [availableModels, model])

  const handleSave = () => {
    const payload: AiSettingsPayload = {
      provider,
      model,
      temperature,
      style,
      enabled,
    }
    saveMutation.mutate(payload)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Configurar IA</CardTitle>
        <CardDescription>Defina o provedor e o tom do assistente.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Provedor</Label>
            <Select value={provider} onValueChange={(value) => setProvider(value as AiProvider)} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o provedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="google">Google</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Modelo</Label>
            <Select value={model} onValueChange={setModel} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o modelo" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Temperatura: {temperature.toFixed(2)}</Label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={temperature}
              onChange={(event) => setTemperature(Number(event.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div className="space-y-2">
            <Label>Estilo do sistema</Label>
            <div className="flex flex-wrap gap-2">
              {styleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStyle(option.value)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs',
                    style === option.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
          />
          Habilitar chat de IA para este workspace
        </label>

        <div className="flex items-center justify-end">
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Salvando...' : 'Salvar configuracoes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
