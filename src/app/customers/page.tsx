import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatsCards } from '@/components/customers/StatsCards'
import { CustomerList } from '@/components/customers/CustomerList'

export const metadata = {
  title: 'Clientes | BTRIX',
  description: 'Gerencie seus clientes e o relacionamento com a oficina',
}

export default function CustomersPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div className="space-y-1">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2 -ml-2 mb-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao painel
              </Button>
            </Link>
            <h1 className="text-3xl font-light tracking-tight text-foreground">
              Clientes
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus clientes e o relacionamento com a oficina
            </p>
          </div>

          <StatsCards />

          <CustomerList />
        </div>
      </div>
    </main>
  )
}
