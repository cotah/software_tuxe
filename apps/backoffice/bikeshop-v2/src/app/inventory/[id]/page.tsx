import { InventoryItemDetail } from '@/components/inventory'

export const metadata = {
  title: 'Detalhes do Item | BTRIX',
  description: 'Detalhes do item de estoque',
}

interface InventoryItemPageProps {
  params: {
    id: string
  }
}

export default function InventoryItemPage({ params }: InventoryItemPageProps) {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <InventoryItemDetail id={params.id} />
      </div>
    </main>
  )
}
