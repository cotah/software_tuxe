import { OrderDetail } from '@/components/order/OrderDetail'

export const metadata = {
  title: 'Detalhes da OS | BTRIX',
  description: 'Detalhes da ordem de serviço',
}

interface OrderPageProps {
  params: {
    id: string
  }
}

export default function OrderPage({ params }: OrderPageProps) {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <OrderDetail orderId={params.id} />
      </div>
    </main>
  )
}
