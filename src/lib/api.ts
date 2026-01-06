import { Order, AlertItem, TimelineEvent, Insight } from '@/types'

export const orders = {
  list: async (): Promise<Order[]> => {
    await new Promise((res) => setTimeout(res, 500))
    return [
      {
        id: '1',
        status: 'ready',
        promisedAt: '2024-01-10T16:00:00Z',
        total: 450,
        customerName: 'João Silva',
        bikeLabel: 'Caloi Elite 2.4',
        serviceSummary: 'Revisão geral',
        notified: false,
      },
      {
        id: '2',
        status: 'ready',
        promisedAt: '2024-01-10T17:00:00Z',
        total: 280,
        customerName: 'Maria Santos',
        bikeLabel: 'Trek Marlin 7',
        serviceSummary: 'Troca de pneu',
        notified: true,
      },
      {
        id: '3',
        status: 'in_progress',
        promisedAt: '2024-01-11T10:00:00Z',
        total: 620,
        customerName: 'Pedro Costa',
        bikeLabel: 'Specialized Rockhopper',
        serviceSummary: 'Manutenção freios + câmbio',
        notified: false,
      },
      {
        id: '4',
        status: 'in_progress',
        promisedAt: '2024-01-11T14:00:00Z',
        total: 150,
        customerName: 'Ana Oliveira',
        bikeLabel: 'Sense Impact Pro',
        serviceSummary: 'Ajuste de câmbio',
        notified: false,
      },
      {
        id: '5',
        status: 'waiting',
        promisedAt: '2024-01-12T09:00:00Z',
        total: 890,
        customerName: 'Lucas Ferreira',
        bikeLabel: 'Scott Scale 970',
        serviceSummary: 'Suspensão + Revisão completa',
        notified: false,
      },
      {
        id: '6',
        status: 'waiting',
        promisedAt: '2024-01-12T11:00:00Z',
        total: 320,
        customerName: 'Fernanda Lima',
        bikeLabel: 'Oggi 7.0',
        serviceSummary: 'Troca de corrente e cassete',
        notified: false,
      },
      {
        id: '7',
        status: 'waiting',
        promisedAt: '2024-01-12T16:00:00Z',
        total: 180,
        customerName: 'Ricardo Alves',
        bikeLabel: 'Cannondale Trail',
        serviceSummary: 'Centragem de rodas',
        notified: false,
      },
      {
        id: '8',
        status: 'ready',
        promisedAt: '2024-01-10T18:00:00Z',
        total: 95,
        customerName: 'Carla Mendes',
        bikeLabel: 'Groove Hype 50',
        serviceSummary: 'Troca de câmara',
        notified: false,
      },
    ]
  },
}

export const alerts = {
  list: async (): Promise<AlertItem[]> => {
    await new Promise((res) => setTimeout(res, 400))
    return [
      {
        id: 'a1',
        severity: 'critical',
        message: 'OS atrasada',
        context: 'desde ontem',
        ctaLabel: 'Ver OS →',
        ctaHref: '/orders/9',
      },
      {
        id: 'a2',
        severity: 'warning',
        message: 'Cliente sem resposta',
        context: 'há 2 dias',
        ctaLabel: 'Responder →',
        ctaHref: '/messages/1',
      },
      {
        id: 'a3',
        severity: 'warning',
        message: 'Estoque crítico: Câmara 29"',
        context: '1 unidade restante',
        ctaLabel: 'Ver estoque →',
        ctaHref: '/inventory/42',
      },
      {
        id: 'a4',
        severity: 'info',
        message: 'Agendamento sem OS',
        context: 'amanhã às 9h',
        ctaLabel: 'Criar OS →',
        ctaHref: '/orders/new',
      },
    ]
  },
}

export const timeline = {
  list: async (): Promise<TimelineEvent[]> => {
    await new Promise((res) => setTimeout(res, 300))
    return [
      {
        id: 't1',
        time: '09:00',
        label: 'Agendamento: Lucas Ferreira',
        type: 'appointment',
        href: '/orders/5',
      },
      {
        id: 't2',
        time: '10:00',
        label: 'Entrega prevista: Pedro Costa',
        type: 'delivery',
        href: '/orders/3',
      },
      {
        id: 't3',
        time: '11:30',
        label: 'Follow-up: Maria Santos',
        type: 'followup',
        href: '/customers/2',
      },
      {
        id: 't4',
        time: '14:00',
        label: 'Prazo: Ana Oliveira',
        type: 'deadline',
        href: '/orders/4',
        severity: 'warning',
      },
      {
        id: 't5',
        time: '16:00',
        label: 'Entrega prevista: João Silva',
        type: 'delivery',
        href: '/orders/1',
      },
      {
        id: 't6',
        time: '17:00',
        label: 'Entrega prevista: Carla Mendes',
        type: 'delivery',
        href: '/orders/8',
      },
    ]
  },
}

export const insights = {
  list: async (): Promise<Insight[]> => {
    await new Promise((res) => setTimeout(res, 600))
    return [
      {
        id: 'i1',
        message: '💡 Câmara 29" usada em 5 serviços este mês. Estoque atual: 1 unidade.',
        actions: [
          { label: 'Ignorar', action: 'ignore' },
          { label: 'Marcar para comprar', action: 'mark_to_buy' },
        ],
      },
      {
        id: 'i2',
        message: '💡 João Silva já fez 3 revisões este ano. Considere oferecer um pacote anual.',
        actions: [
          { label: 'Ignorar', action: 'ignore' },
          { label: 'Marcar para comprar', action: 'mark_to_buy' },
        ],
      },
    ]
  },
}

export const dashboard = {
  getSummary: async () => {
    await new Promise((res) => setTimeout(res, 200))
    return {
      userName: 'Carlos',
      hasCritical: true,
    }
  },
}
