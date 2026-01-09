import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Robôs | BTRIX',
  description: 'Monitoramento dos atendentes e automações',
}

const statusCards = [
  { title: 'Online', description: 'Agentes operando normalmente', value: '5' },
  { title: 'Atenção', description: 'Precisam de revisao', value: '2' },
  { title: 'Offline', description: 'Indisponiveis no momento', value: '1' },
]

export default function RobotsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-light tracking-tight">Robôs / Atendentes</h1>
          <p className="text-muted-foreground">
            Acompanhe o status dos agentes de automacao e atendimento.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {statusCards.map((card) => (
            <Card key={card.title}>
              <CardHeader>
                <CardTitle className="text-xl">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-foreground">{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">Atividade recente</h2>
          <Card>
            <CardContent className="space-y-3 pt-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="h-4 w-full animate-pulse rounded bg-muted"
                  style={{ width: `${80 + (index % 3) * 6}%` }}
                />
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
