import { CommandCenterClient } from '@/components/command-center/CommandCenterClient'

export const metadata = {
  title: 'Command Center | BTRIX',
  description: 'Painel de controle principal da sua oficina de bicicletas',
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <CommandCenterClient />
      </div>
    </main>
  )
}
