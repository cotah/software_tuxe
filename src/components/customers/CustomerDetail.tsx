'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, MessageSquare, UserCheck, UserX } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCustomer } from '@/hooks/useDataHooks'
import { CustomerSummaryCard } from './CustomerSummaryCard'
import { CustomerOrdersList } from './CustomerOrdersList'
import { CustomerStatus } from '@/types'

interface CustomerDetailProps {
  customerId: string
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-muted rounded w-48" />
      <div className="h-48 bg-muted rounded" />
      <div className="h-64 bg-muted rounded" />
    </div>
  )
}

function QuickActions({
  customerId,
  status,
  onStatusChange,
}: {
  customerId: string
  status: CustomerStatus
  onStatusChange: (newStatus: CustomerStatus) => void
}) {
  const [showMessage, setShowMessage] = useState(false)

  const handleSendMessage = () => {
    setShowMessage(true)
    setTimeout(() => setShowMessage(false), 2000)
  }

  const handleToggleStatus = () => {
    const newStatus: CustomerStatus = status === 'active' ? 'inactive' : 'active'
    onStatusChange(newStatus)
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/orders/new?customerId=${customerId}`}>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Criar OS
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleSendMessage}
          >
            <MessageSquare className="h-4 w-4" />
            {showMessage ? 'Em breve' : 'Enviar mensagem'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleToggleStatus}
          >
            {status === 'active' ? (
              <>
                <UserX className="h-4 w-4" />
                Marcar inativo
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4" />
                Marcar ativo
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function CustomerDetail({ customerId }: CustomerDetailProps) {
  const { data: customer, isLoading, error } = useCustomer(customerId)
  const [localStatus, setLocalStatus] = useState<CustomerStatus | null>(null)

  const currentStatus = localStatus ?? customer?.status

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error || !customer) {
    return (
      <div className="space-y-6">
        <Link href="/customers">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Cliente não encontrado
          </CardContent>
        </Card>
      </div>
    )
  }

  const customerWithStatus = {
    ...customer,
    status: currentStatus ?? customer.status,
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/customers">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-light tracking-tight text-foreground mb-2">
          Perfil do Cliente
        </h1>
        <p className="text-muted-foreground">
          Informações e histórico de {customer.name}
        </p>
      </div>

      <QuickActions
        customerId={customerId}
        status={customerWithStatus.status}
        onStatusChange={setLocalStatus}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CustomerSummaryCard customer={customerWithStatus} />
        </div>
        <div className="lg:col-span-2">
          <CustomerOrdersList customerId={customerId} />
        </div>
      </div>
    </div>
  )
}
