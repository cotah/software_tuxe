interface GreetingSummaryProps {
  userName: string
  orderCount: number
  deliveryCount: number
  awaitingResponseCount: number
  hasCritical: boolean
  criticalCount?: number
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function GreetingSummary({
  userName,
  orderCount,
  deliveryCount,
  awaitingResponseCount,
  hasCritical,
  criticalCount = 1,
}: GreetingSummaryProps) {
  const greeting = getGreeting()

  return (
    <section className="space-y-2">
      <h1 className="text-3xl font-light tracking-tight text-foreground">
        {greeting}, {userName}
      </h1>
      <p className="text-lg text-muted-foreground">
        Hoje você tem {orderCount} bikes na oficina, {deliveryCount} entregas previstas
        {awaitingResponseCount > 0 && ` e ${awaitingResponseCount} clientes aguardando resposta`}.
      </p>
      {hasCritical && (
        <p className="text-base text-amber-600">
          Você tem {criticalCount} OS atrasada que precisa de atenção.
        </p>
      )}
    </section>
  )
}
