import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OrderList } from '@/components/order/OrderList'

export const metadata = {
  title: 'Ordens de Serviço | BTRIX',
  description: 'Gerenciamento de ordens de serviço da oficina',
}

export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2 -ml-2 mb-2">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao painel
                </Button>
              </Link>
              <h1 className="text-3xl font-light tracking-tight text-foreground">
                Ordens de Serviço
              </h1>
              <p className="text-muted-foreground">
                Gerencie todas as ordens de serviço da oficina
              </p>
            </div>
          </div>

          <OrderList />
        </div>
      </div>
    </main>
  )
}
