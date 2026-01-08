'use client'

import { Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useCustomers } from '@/hooks/useDataHooks'
import { CustomerCard } from './CustomerCard'

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-muted rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-40" />
                    <div className="h-3 bg-muted rounded w-48" />
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="h-3 bg-muted rounded w-24" />
                  <div className="h-3 bg-muted rounded w-20" />
                  <div className="h-3 bg-muted rounded w-16" />
                </div>
              </div>
              <div className="h-8 w-24 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-muted rounded-full">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <p className="text-muted-foreground">Nenhum cliente cadastrado ainda.</p>
      </CardContent>
    </Card>
  )
}

function ErrorState() {
  return (
    <Card>
      <CardContent className="p-6 text-center text-muted-foreground">
        Erro ao carregar clientes
      </CardContent>
    </Card>
  )
}

export function CustomerList() {
  const { data: customers, isLoading, error } = useCustomers()

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorState />
  }

  if (!customers || customers.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="space-y-4">
      {customers.map((customer) => (
        <CustomerCard key={customer.id} customer={customer} />
      ))}
    </div>
  )
}
