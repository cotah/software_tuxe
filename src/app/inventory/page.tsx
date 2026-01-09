import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InventoryList } from '@/components/inventory'

export const metadata = {
  title: 'Estoque | BTRIX',
  description: 'Gerenciamento de estoque da oficina',
}

export default function InventoryPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div className="space-y-1">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2 -ml-2 mb-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao painel
              </Button>
            </Link>
            <h1 className="text-3xl font-light tracking-tight text-foreground">
              Estoque
            </h1>
            <p className="text-muted-foreground">
              Gerencie o inventário da oficina
            </p>
          </div>

          <InventoryList />
        </div>
      </div>
    </main>
  )
}
