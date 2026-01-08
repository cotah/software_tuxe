'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useAiChat } from '@/hooks/useAiChat'
import type { AiChatRequest, AiMessage } from '@/types'

const QUICK_PROMPTS = [
  'Como esta minha demanda essa semana?',
  'Quais servicos dao mais lucro?',
  'O que eu devo priorizar hoje?',
]

const DEFAULT_TENANT = 'demo-tenant'
const DEFAULT_USER = 'demo-user'

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `msg_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function getStorageKey(tenantId: string, userId: string) {
  return `btrix_ai_chat_${tenantId}_${userId}`
}

export function AiChatClient() {
  const [messages, setMessages] = useState<AiMessage[]>([])
  const [input, setInput] = useState('')
  const [lastPayload, setLastPayload] = useState<AiChatRequest | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const messagesRef = useRef<AiMessage[]>([])
  const { mutateAsync, isPending, error, reset } = useAiChat()

  const tenantId = DEFAULT_TENANT
  const userId = DEFAULT_USER
  const storageKey = useMemo(() => getStorageKey(tenantId, userId), [tenantId, userId])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(storageKey)
    if (!stored) return
    try {
      const parsed = JSON.parse(stored) as AiMessage[]
      if (Array.isArray(parsed)) {
        setMessages(parsed)
      }
    } catch {
      // Ignore storage errors
    }
  }, [storageKey])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(storageKey, JSON.stringify(messages))
  }, [messages, storageKey])

  useEffect(() => {
    if (!bottomRef.current) return
    bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isPending])

  const buildPayload = useCallback(
    (nextMessages: AiMessage[]): AiChatRequest => ({
      messages: nextMessages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      context: {
        app: 'bikeshop',
        userId,
        tenantId,
      },
    }),
    [tenantId, userId]
  )

  const appendUserMessage = useCallback((content: string) => {
    const userMessage: AiMessage = {
      id: createId(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])
    return userMessage
  }, [])

  const appendAssistantMessage = useCallback((content: string) => {
    const assistantMessage: AiMessage = {
      id: createId(),
      role: 'assistant',
      content,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, assistantMessage])
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed || isPending) return

      reset()
      setInput('')

      const userMessage = appendUserMessage(trimmed)
      const payload = buildPayload([...messagesRef.current, userMessage])
      setLastPayload(payload)

      try {
        const response = await mutateAsync(payload)
        appendAssistantMessage(response.reply)
      } catch {
        // handled by error state
      }
    },
    [appendAssistantMessage, appendUserMessage, buildPayload, isPending, mutateAsync, reset]
  )

  const handleRetry = useCallback(async () => {
    if (!lastPayload || isPending) return
    reset()
    try {
      const response = await mutateAsync(lastPayload)
      appendAssistantMessage(response.reply)
    } catch {
      // handled by error state
    }
  }, [appendAssistantMessage, isPending, lastPayload, mutateAsync, reset])

  const handleClear = useCallback(() => {
    setMessages([])
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(storageKey)
    }
  }, [storageKey])

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void sendMessage(input)
    }
  }

  const isEmpty = messages.length === 0
  const errorMessage = error instanceof Error ? error.message : 'Erro ao conectar com a IA.'
  const showNotConfigured = errorMessage.toLowerCase().includes('not configured')

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-light tracking-tight sm:text-4xl">AI</h1>
          <p className="text-muted-foreground">
            Converse sobre sua oficina e receba insights.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">Modo: Bike Shop</Badge>
          <Button variant="ghost" onClick={handleClear}>
            Limpar chat
          </Button>
        </div>
      </header>

      <Card className="flex min-h-[60vh] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {isEmpty && (
            <div className="rounded-xl border border-dashed bg-muted/40 px-6 py-10 text-center text-sm text-muted-foreground">
              Envie uma pergunta para comecar a conversa.
            </div>
          )}

          {messages.map((message) => {
            const isUser = message.role === 'user'
            return (
              <div
                key={message.id}
                className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[min(520px,90%)] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm shadow-sm',
                    isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  )}
                >
                  {message.content}
                </div>
              </div>
            )
          })}

          {isPending && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                Pensando...
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <div>
                {showNotConfigured
                  ? 'AI nao configurada no backend. Verifique o endpoint /ai/chat.'
                  : errorMessage}
              </div>
              <Button variant="outline" size="sm" onClick={handleRetry} className="mt-3">
                Tentar novamente
              </Button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="border-t border-border bg-background px-6 py-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void sendMessage(prompt)}
                className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground transition hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                disabled={isPending}
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua pergunta..."
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Digite sua mensagem"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Sugestoes devem ser revisadas antes de agir.
              </p>
              <Button
                type="button"
                onClick={() => void sendMessage(input)}
                disabled={!input.trim() || isPending}
              >
                Enviar
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </section>
  )
}
