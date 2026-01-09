'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useAiChat, useAiSettings } from '@/hooks/useDataHooks'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

const mockReplies = [
  'Com base nos dados recentes, revisoes gerais seguem com a melhor margem.',
  'Seu volume de entregas atrasadas subiu esta semana; vale revisar a agenda.',
  'Clientes novos estao vindo mais pelo Instagram do que pelo WhatsApp.',
]

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function AiChatClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const endRef = useRef<HTMLDivElement | null>(null)
  const { data: settings } = useAiSettings()
  const chatMutation = useAiChat()

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const providerLabel = useMemo(() => {
    const provider = settings?.provider || 'openai'
    if (provider === 'anthropic') return 'Anthropic'
    if (provider === 'google') return 'Google'
    return 'OpenAI'
  }, [settings?.provider])

  const modelLabel = settings?.model || 'gpt-4.1-mini'

  const sendMessage = async () => {
    if (!canSend) return
    setError(null)

    const newMessage: ChatMessage = {
      id: createId(),
      role: 'user',
      content: input.trim(),
      createdAt: new Date().toISOString(),
    }

    const nextMessages = [...messages, newMessage]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await chatMutation.mutateAsync({
        conversationId,
        messages: nextMessages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        context: {
          app: 'bikeshop',
          tenantId: 'demo-tenant',
          userId: 'demo-user',
        },
      })
      setConversationId(response.conversationId)
      setMessages((prev) => [
        ...prev,
        {
          id: response.message.id,
          role: 'assistant',
          content: response.message.content,
          createdAt: response.message.createdAt,
        },
      ])
      setLoading(false)
    } catch {
      const fallback = mockReplies[Math.floor(Math.random() * mockReplies.length)]
      setError('IA indisponivel. Resposta simulada exibida.')
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: 'assistant',
          content: fallback,
          createdAt: new Date().toISOString(),
        },
      ])
      setLoading(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    setError(null)
    setLoading(false)
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-2xl border bg-background shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="text-lg font-medium">AI</h2>
          <p className="text-sm text-muted-foreground">Converse sobre sua oficina e receba insights.</p>
          <p className="text-xs text-muted-foreground">
            {providerLabel} • {modelLabel}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={clearChat}>
          Limpar
        </Button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {messages.length === 0 ? (
          <div className="rounded-xl border border-dashed px-4 py-6 text-sm text-muted-foreground">
            Pergunte algo sobre vendas, agenda ou prioridades do dia.
          </div>
        ) : null}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex w-full',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm',
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              )}
            >
              {message.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
              Pensando...
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div ref={endRef} />
      </div>

      <div className="space-y-3 border-t px-5 py-4">
        <Textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua pergunta..."
          rows={3}
          className="resize-none"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            Sugestoes devem ser revisadas antes de agir.
          </span>
          <Button onClick={sendMessage} disabled={!canSend}>
            Enviar
          </Button>
        </div>
      </div>
    </div>
  )
}
