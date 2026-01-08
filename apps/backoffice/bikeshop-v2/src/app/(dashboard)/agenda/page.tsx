import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AgendaView } from '@/components/agenda'

export const metadata = {
  title: 'Agenda | BTRIX',
  description: 'Gerencie seus compromissos e agendamentos',
}

export default function AgendaPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao painel
            </Button>
          </Link>

          <AgendaView />
        </div>
      </div>
    </main>
  )
}
