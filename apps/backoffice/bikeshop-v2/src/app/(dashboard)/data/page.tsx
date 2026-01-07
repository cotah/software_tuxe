import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Data | BTRIX',
  description: 'Indicadores de saude e desempenho da oficina',
}

const kpis = [
  {
    title: 'Receita do mes',
    value: 'R$ 128.450',
    change: 'Alta de 12% vs mes passado',
    tone: 'text-emerald-600',
  },
  {
    title: 'Pedidos do mes',
    value: '428',
    change: 'Cresceu 5% vs mes passado',
    tone: 'text-emerald-600',
  },
  {
    title: 'Ticket medio',
    value: 'R$ 184',
    change: 'Estavel nas ultimas 4 semanas',
    tone: 'text-muted-foreground',
  },
  {
    title: 'Tempo medio de entrega',
    value: '2h 40m',
    change: 'Leve atraso vs meta',
    tone: 'text-amber-600',
  },
]

const trends = [
  {
    label: 'Revisoes gerais seguem como o servico mais rentavel.',
    tone: 'text-emerald-600',
  },
  {
    label: 'Picos de atendimento em quinta e sabado; revisar escalas.',
    tone: 'text-muted-foreground',
  },
  {
    label: 'Atrasos concentrados em entregas expressas.',
    tone: 'text-amber-600',
  },
]

const opportunities = [
  {
    label: 'Clientes recorrentes estao visitando a oficina a cada 42 dias.',
    tone: 'text-muted-foreground',
  },
  {
    label: 'Planos de manutencao preventiva podem elevar o ticket medio.',
    tone: 'text-emerald-600',
  },
  {
    label: 'Revisar estoque de pneus premium antes do fim de semana.',
    tone: 'text-amber-600',
  },
]

export default function DataPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-light tracking-tight">Data</h1>
          <p className="text-muted-foreground">
            Visao executiva do desempenho da oficina neste mes.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.title}>
              <CardHeader>
                <CardDescription>{kpi.title}</CardDescription>
                <CardTitle className="text-3xl">{kpi.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-sm ${kpi.tone}`}>{kpi.change}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Tendencias da semana</CardTitle>
              <CardDescription>Movimentos recentes do negocio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {trends.map((item) => (
                <p key={item.label} className={`text-sm ${item.tone}`}>
                  {item.label}
                </p>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Alertas e oportunidades</CardTitle>
              <CardDescription>Onde agir agora.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {opportunities.map((item) => (
                <p key={item.label} className={`text-sm ${item.tone}`}>
                  {item.label}
                </p>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
