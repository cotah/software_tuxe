'use client'

import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Plus, Search, Send, Phone, MessageCircle } from 'lucide-react'
import { api, getAiSuggestion } from '@/lib/api'
import { formatCurrency, formatRelativeTime, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CustomerCard, CustomerDetailHeader } from '@/components/blocks/customer-card'
import { AiSummaryCard, AiReplySuggestion } from '@/components/blocks/ai-suggestion'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types'

export default function CustomersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedId = searchParams.get('id')
  const [searchQuery, setSearchQuery] = useState('')
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await api.customers.list()
      return res.data
    },
  })

  const { data: selectedCustomer, isLoading: customerLoading } = useQuery({
    queryKey: ['customers', selectedId],
    queryFn: async () => {
      if (!selectedId) return null
      const res = await api.customers.get(selectedId)
      return res.data
    },
    enabled: !!selectedId,
  })

  const { data: customerOrders } = useQuery({
    queryKey: ['customers', selectedId, 'orders'],
    queryFn: async () => {
      if (!selectedId) return []
      const res = await api.customers.getOrders(selectedId)
      return res.data
    },
    enabled: !!selectedId,
  })

  const { data: conversation } = useQuery({
    queryKey: ['customers', selectedId, 'conversation'],
    queryFn: async () => {
      if (!selectedId) return []
      const res = await api.customers.getConversation(selectedId)
      return res.data
    },
    enabled: !!selectedId,
  })

  // Get AI suggestion when customer changes
  useEffect(() => {
    if (selectedId) {
      getAiSuggestion({ customerId: selectedId, type: 'reply' }).then(
        setAiSuggestion
      )
    }
  }, [selectedId])

  const filteredCustomers = customers?.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Check if customer has pending attention
  const hasAlert = (customerId: string) => {
    // Mock: Maria Costa has pending attention
    return customerId === '3'
  }

  const selectCustomer = (id: string) => {
    router.push(`/customers?id=${id}`)
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex animate-fade-in">
      {/* Left Panel - Customer List */}
      <div className="w-80 lg:w-96 border-r border-border bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold text-text-primary">Clientes</h1>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Novo
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <Input
              placeholder="Buscar cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Customer List */}
        <div className="flex-1 overflow-y-auto p-2">
          {customersLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : filteredCustomers?.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              Nenhum cliente encontrado
            </div>
          ) : (
            filteredCustomers?.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                isSelected={customer.id === selectedId}
                hasAlert={hasAlert(customer.id)}
                onClick={() => selectCustomer(customer.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Customer Details */}
      <div className="flex-1 bg-surface-secondary overflow-y-auto">
        {!selectedId ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-surface-tertiary mx-auto mb-4 flex items-center justify-center">
                <Search className="h-8 w-8 text-text-tertiary" />
              </div>
              <p className="text-text-secondary">
                Selecione um cliente para ver os detalhes
              </p>
            </div>
          </div>
        ) : customerLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
          </div>
        ) : selectedCustomer ? (
          <div>
            {/* Customer Header */}
            <div className="bg-white border-b border-border">
              <CustomerDetailHeader customer={selectedCustomer} />
            </div>

            <div className="p-6 space-y-6">
              {/* AI Summary */}
              {selectedCustomer.aiSummary && (
                <AiSummaryCard summary={selectedCustomer.aiSummary} />
              )}

              {/* Conversation */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Conversa
                    </CardTitle>
                    <Badge variant="outline">WhatsApp</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Messages */}
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {conversation?.length === 0 ? (
                      <p className="text-sm text-text-secondary text-center py-4">
                        Nenhuma mensagem ainda
                      </p>
                    ) : (
                      conversation?.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.direction === 'outbound' ? 'justify-end' : ''
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-xl px-4 py-2 ${
                              msg.direction === 'outbound'
                                ? 'bg-brand-500 text-white'
                                : 'bg-surface-secondary text-text-primary'
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                msg.direction === 'outbound'
                                  ? 'text-white/70'
                                  : 'text-text-tertiary'
                              }`}
                            >
                              {formatRelativeTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* AI Suggestion */}
                  {aiSuggestion && (
                    <div className="mb-4">
                      <AiReplySuggestion
                        suggestion={aiSuggestion}
                        onUse={() => {
                          setMessageInput(aiSuggestion)
                          setAiSuggestion(null)
                        }}
                        onDismiss={() => setAiSuggestion(null)}
                      />
                    </div>
                  )}

                  {/* Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Escrever mensagem..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Order History */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Histórico de Serviços</CardTitle>
                </CardHeader>
                <CardContent>
                  {customerOrders?.length === 0 ? (
                    <p className="text-sm text-text-secondary">
                      Nenhum serviço realizado
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {customerOrders?.map((order) => (
                        <div
                          key={order.id}
                          onClick={() => router.push(`/orders/${order.id}`)}
                          className="flex items-center justify-between p-3 rounded-lg bg-surface-secondary hover:bg-surface-tertiary cursor-pointer transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-text-primary">
                                OS #{order.orderNumber}
                              </span>
                              <Badge
                                className={ORDER_STATUS_COLORS[order.status]}
                              >
                                {ORDER_STATUS_LABELS[order.status]}
                              </Badge>
                            </div>
                            <p className="text-sm text-text-secondary">
                              {order.services.map((s) => s.name).join(', ') ||
                                'Sem serviços'}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-medium text-text-primary">
                              {formatCurrency(order.totalValue)}
                            </span>
                            <p className="text-xs text-text-tertiary">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button variant="secondary" className="flex-1">
                      <Plus className="h-4 w-4 mr-1" />
                      Nova OS
                    </Button>
                    <Button variant="secondary" className="flex-1">
                      Agendar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
