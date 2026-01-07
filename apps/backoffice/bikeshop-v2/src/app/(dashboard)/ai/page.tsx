import { AiChatClient } from '@/components/ai/AiChatClient'

export const metadata = {
  title: 'AI | BTRIX',
  description: 'Assistente de negocio para a oficina',
}

export default function AiPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-2 pb-6">
          <h1 className="text-3xl font-light tracking-tight">AI</h1>
          <p className="text-muted-foreground">
            Assistente estrategico para apoiar decisoes da oficina.
          </p>
        </div>
        <AiChatClient />
      </div>
    </main>
  )
}
