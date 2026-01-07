'use client'

import { useCallback, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const mockReplies = [
  'Com base nos seus dados recentes, revisoes gerais sao o servico mais lucrativo.',
  'Voce teve um pico de entregas atrasadas esta semana. Vale revisar a agenda.',
  'Clientes recorrentes respondem melhor a lembretes de manutencao a cada 45 dias.',
  'O ticket medio pode subir com kits de revisao premium e check-up rapido.',
]

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function AiChatClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Estou pronto para ajudar com decisoes do dia a dia da oficina.',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const replyIndex = useRef(0)

  const sendMessage = useCallback(async (message: string) => {
    // TODO: Replace mock response with POST /api/ai/chat
    const delay = message.length > 140 ? 1200 : 900
    await wait(delay)
    const reply = mockReplies[replyIndex.current % mockReplies.length]
    replyIndex.current += 1
    return reply
  }, [])

  const handleSend = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const reply = await sendMessage(trimmed)
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: reply,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, sendMessage])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void handleSend()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSend()
    }
  }

  return (
    <div className="flex min-h-[60vh] flex-col gap-6">
      <div className="flex-1 space-y-4 pb-10">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[70%] rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
              Pensando...
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 border-t border-border bg-background/90 pb-6 pt-4 backdrop-blur">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua pergunta ou pedido..."
            className="min-h-[80px] w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Sugestoes de IA devem ser revisadas antes do envio.
            </p>
            <Button type="submit" disabled={!input.trim() || isLoading}>
              Enviar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
