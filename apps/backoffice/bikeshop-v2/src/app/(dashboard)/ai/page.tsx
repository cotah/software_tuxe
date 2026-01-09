import { AiChatClient } from '@/components/ai/AiChatClient'

export const metadata = {
  title: 'AI | BTRIX',
  description: 'Assistente de insights para a oficina',
}

export default function AiPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <AiChatClient />
      </div>
    </main>
  )
}
