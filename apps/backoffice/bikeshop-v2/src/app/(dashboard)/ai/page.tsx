import { AiChatClient } from '@/components/ai/AiChatClient'

export const metadata = {
  title: 'AI | BTRIX',
  description: 'Assistente inteligente para a oficina',
}

export default function AiPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <AiChatClient />
      </div>
    </main>
  )
}
