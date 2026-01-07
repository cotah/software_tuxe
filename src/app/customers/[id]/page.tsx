import { CustomerDetail } from '@/components/customers/CustomerDetail'

export const metadata = {
  title: 'Perfil do Cliente | BTRIX',
  description: 'Detalhes e histórico do cliente',
}

interface CustomerPageProps {
  params: {
    id: string
  }
}

export default function CustomerPage({ params }: CustomerPageProps) {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <CustomerDetail customerId={params.id} />
      </div>
    </main>
  )
}
