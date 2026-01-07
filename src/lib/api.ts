import { Order, OrderDetail, AlertItem, TimelineEvent, Insight, CustomerListItem, CustomerDetail } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

// Local storage key for notified orders fallback
const NOTIFIED_ORDERS_KEY = 'btrix_notified_orders'

function getNotifiedOrdersFromStorage(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const stored = localStorage.getItem(NOTIFIED_ORDERS_KEY)
    return stored ? new Set(JSON.parse(stored)) : new Set()
  } catch {
    return new Set()
  }
}

function saveNotifiedOrderToStorage(orderId: string): void {
  if (typeof window === 'undefined') return
  try {
    const current = getNotifiedOrdersFromStorage()
    current.add(orderId)
    localStorage.setItem(NOTIFIED_ORDERS_KEY, JSON.stringify(Array.from(current)))
  } catch {
    // Ignore storage errors
  }
}

const ordersData: OrderDetail[] = [
  {
    id: '1',
    status: 'ready',
    promisedAt: '2024-01-10T16:00:00Z',
    createdAt: '2024-01-08T09:00:00Z',
    total: 450,
    customerName: 'João Silva',
    bikeLabel: 'Caloi Elite 2.4',
    serviceSummary: 'Revisão geral',
    notified: false,
    customer: {
      id: 'c1',
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '(11) 99999-1234',
    },
    bike: {
      id: 'b1',
      brand: 'Caloi',
      model: 'Elite 2.4',
      color: 'Preto/Vermelho',
      year: 2023,
    },
    services: [
      { id: 's1', name: 'Revisão geral', price: 250, quantity: 1 },
      { id: 's2', name: 'Troca de pastilhas de freio', price: 120, quantity: 1 },
      { id: 's3', name: 'Lubrificação de corrente', price: 80, quantity: 1 },
    ],
    notes: 'Cliente pediu para verificar barulho na roda traseira',
  },
  {
    id: '2',
    status: 'ready',
    promisedAt: '2024-01-10T17:00:00Z',
    createdAt: '2024-01-09T10:00:00Z',
    total: 280,
    customerName: 'Maria Santos',
    bikeLabel: 'Trek Marlin 7',
    serviceSummary: 'Troca de pneu',
    notified: true,
    customer: {
      id: 'c2',
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '(11) 98888-5678',
    },
    bike: {
      id: 'b2',
      brand: 'Trek',
      model: 'Marlin 7',
      color: 'Azul',
      year: 2022,
    },
    services: [
      { id: 's4', name: 'Troca de pneu dianteiro', price: 180, quantity: 1 },
      { id: 's5', name: 'Troca de câmara', price: 50, quantity: 2 },
    ],
  },
  {
    id: '3',
    status: 'in_progress',
    promisedAt: '2024-01-11T10:00:00Z',
    createdAt: '2024-01-09T14:00:00Z',
    total: 620,
    customerName: 'Pedro Costa',
    bikeLabel: 'Specialized Rockhopper',
    serviceSummary: 'Manutenção freios + câmbio',
    notified: false,
    customer: {
      id: 'c3',
      name: 'Pedro Costa',
      email: 'pedro.costa@email.com',
      phone: '(11) 97777-9012',
    },
    bike: {
      id: 'b3',
      brand: 'Specialized',
      model: 'Rockhopper',
      color: 'Verde',
      year: 2021,
    },
    services: [
      { id: 's6', name: 'Regulagem de câmbio traseiro', price: 150, quantity: 1 },
      { id: 's7', name: 'Regulagem de câmbio dianteiro', price: 120, quantity: 1 },
      { id: 's8', name: 'Sangria de freio hidráulico', price: 200, quantity: 2 },
      { id: 's9', name: 'Troca de cabos de câmbio', price: 150, quantity: 1 },
    ],
  },
  {
    id: '4',
    status: 'in_progress',
    promisedAt: '2024-01-11T14:00:00Z',
    createdAt: '2024-01-10T08:00:00Z',
    total: 150,
    customerName: 'Ana Oliveira',
    bikeLabel: 'Sense Impact Pro',
    serviceSummary: 'Ajuste de câmbio',
    notified: false,
    customer: {
      id: 'c4',
      name: 'Ana Oliveira',
      email: 'ana.oliveira@email.com',
      phone: '(11) 96666-3456',
    },
    bike: {
      id: 'b4',
      brand: 'Sense',
      model: 'Impact Pro',
      color: 'Branco/Rosa',
      year: 2023,
    },
    services: [
      { id: 's10', name: 'Ajuste de câmbio traseiro', price: 80, quantity: 1 },
      { id: 's11', name: 'Ajuste de câmbio dianteiro', price: 70, quantity: 1 },
    ],
  },
  {
    id: '5',
    status: 'waiting',
    promisedAt: '2024-01-12T09:00:00Z',
    createdAt: '2024-01-10T09:00:00Z',
    total: 890,
    customerName: 'Lucas Ferreira',
    bikeLabel: 'Scott Scale 970',
    serviceSummary: 'Suspensão + Revisão completa',
    notified: false,
    customer: {
      id: 'c5',
      name: 'Lucas Ferreira',
      email: 'lucas.ferreira@email.com',
      phone: '(11) 95555-7890',
    },
    bike: {
      id: 'b5',
      brand: 'Scott',
      model: 'Scale 970',
      color: 'Laranja/Preto',
      year: 2022,
    },
    services: [
      { id: 's12', name: 'Revisão de suspensão dianteira', price: 350, quantity: 1 },
      { id: 's13', name: 'Revisão geral', price: 250, quantity: 1 },
      { id: 's14', name: 'Troca de óleo de suspensão', price: 180, quantity: 1 },
      { id: 's15', name: 'Troca de rolamentos do movimento central', price: 110, quantity: 1 },
    ],
    notes: 'Aguardando peça de suspensão chegar',
  },
  {
    id: '6',
    status: 'waiting',
    promisedAt: '2024-01-12T11:00:00Z',
    createdAt: '2024-01-10T11:00:00Z',
    total: 320,
    customerName: 'Fernanda Lima',
    bikeLabel: 'Oggi 7.0',
    serviceSummary: 'Troca de corrente e cassete',
    notified: false,
    customer: {
      id: 'c6',
      name: 'Fernanda Lima',
      email: 'fernanda.lima@email.com',
      phone: '(11) 94444-1234',
    },
    bike: {
      id: 'b6',
      brand: 'Oggi',
      model: '7.0',
      color: 'Cinza',
      year: 2021,
    },
    services: [
      { id: 's16', name: 'Troca de corrente', price: 120, quantity: 1 },
      { id: 's17', name: 'Troca de cassete', price: 200, quantity: 1 },
    ],
    notes: 'Aguardando cassete 12v em estoque',
  },
  {
    id: '7',
    status: 'waiting',
    promisedAt: '2024-01-12T16:00:00Z',
    createdAt: '2024-01-10T14:00:00Z',
    total: 180,
    customerName: 'Ricardo Alves',
    bikeLabel: 'Cannondale Trail',
    serviceSummary: 'Centragem de rodas',
    notified: false,
    customer: {
      id: 'c7',
      name: 'Ricardo Alves',
      email: 'ricardo.alves@email.com',
      phone: '(11) 93333-5678',
    },
    bike: {
      id: 'b7',
      brand: 'Cannondale',
      model: 'Trail',
      color: 'Vermelho',
      year: 2020,
    },
    services: [
      { id: 's18', name: 'Centragem de roda dianteira', price: 90, quantity: 1 },
      { id: 's19', name: 'Centragem de roda traseira', price: 90, quantity: 1 },
    ],
  },
  {
    id: '8',
    status: 'ready',
    promisedAt: '2024-01-10T18:00:00Z',
    createdAt: '2024-01-10T15:00:00Z',
    total: 95,
    customerName: 'Carla Mendes',
    bikeLabel: 'Groove Hype 50',
    serviceSummary: 'Troca de câmara',
    notified: false,
    customer: {
      id: 'c8',
      name: 'Carla Mendes',
      email: 'carla.mendes@email.com',
      phone: '(11) 92222-9012',
    },
    bike: {
      id: 'b8',
      brand: 'Groove',
      model: 'Hype 50',
      color: 'Rosa',
      year: 2023,
    },
    services: [
      { id: 's20', name: 'Troca de câmara traseira', price: 45, quantity: 1 },
      { id: 's21', name: 'Troca de câmara dianteira', price: 50, quantity: 1 },
    ],
  },
  {
    id: '9',
    status: 'in_progress',
    promisedAt: '2024-01-09T18:00:00Z',
    createdAt: '2024-01-07T10:00:00Z',
    total: 750,
    customerName: 'Marcos Souza',
    bikeLabel: 'Giant Talon 2',
    serviceSummary: 'Revisão completa + troca de componentes',
    notified: false,
    customer: {
      id: 'c9',
      name: 'Marcos Souza',
      email: 'marcos.souza@email.com',
      phone: '(11) 91111-3456',
    },
    bike: {
      id: 'b9',
      brand: 'Giant',
      model: 'Talon 2',
      color: 'Azul/Preto',
      year: 2021,
    },
    services: [
      { id: 's22', name: 'Revisão geral', price: 250, quantity: 1 },
      { id: 's23', name: 'Troca de guidão', price: 300, quantity: 1 },
      { id: 's24', name: 'Troca de manoplas', price: 80, quantity: 1 },
      { id: 's25', name: 'Troca de fita de guidão', price: 120, quantity: 1 },
    ],
    notes: 'OS ATRASADA - Cliente aguardando desde ontem',
  },
]

export const orders = {
  list: async (): Promise<Order[]> => {
    await new Promise((res) => setTimeout(res, 500))
    const notifiedFromStorage = getNotifiedOrdersFromStorage()
    return ordersData.map((order) => ({
      id: order.id,
      status: order.status,
      promisedAt: order.promisedAt,
      createdAt: order.createdAt,
      total: order.total,
      customerName: order.customerName,
      bikeLabel: order.bikeLabel,
      serviceSummary: order.serviceSummary,
      notified: order.notified || notifiedFromStorage.has(order.id),
      customer: order.customer,
      bike: order.bike,
    }))
  },

  getById: async (id: string): Promise<OrderDetail | null> => {
    await new Promise((res) => setTimeout(res, 300))
    const order = ordersData.find((order) => order.id === id)
    if (!order) return null
    const notifiedFromStorage = getNotifiedOrdersFromStorage()
    return {
      ...order,
      notified: order.notified || notifiedFromStorage.has(order.id),
    }
  },

  notify: async (id: string): Promise<{ success: boolean }> => {
    // TODO: Replace with real API call when backend endpoint is available
    // Try backend first: PATCH /orders/:id { notified: true } or POST /orders/:id/notify
    if (API_URL) {
      try {
        const response = await fetch(`${API_URL}/orders/${id}/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
        if (response.ok) {
          return { success: true }
        }
      } catch {
        // Backend not available, fallback to local storage
      }
    }

    // Fallback: persist to localStorage
    await new Promise((res) => setTimeout(res, 200))
    saveNotifiedOrderToStorage(id)
    return { success: true }
  },

  search: async (query: string): Promise<Order[]> => {
    const allOrders = await orders.list()
    if (!query.trim()) return allOrders.slice(0, 20)
    const lowerQuery = query.toLowerCase()
    return allOrders.filter(
      (order) =>
        order.customerName.toLowerCase().includes(lowerQuery) ||
        order.bikeLabel.toLowerCase().includes(lowerQuery)
    ).slice(0, 20)
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
        ctaHref: '/orders/2',
      },
      {
        id: 'a3',
        severity: 'warning',
        message: 'Estoque crítico: Câmara 29"',
        context: '1 unidade restante',
        ctaLabel: 'Ver estoque →',
        ctaHref: '/orders',
      },
      {
        id: 'a4',
        severity: 'info',
        message: 'Agendamento sem OS',
        context: 'amanhã às 9h',
        ctaLabel: 'Criar OS →',
        ctaHref: '/orders',
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
        href: '/orders/2',
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

const customersData: CustomerListItem[] = [
  {
    id: 'c1',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    status: 'active',
    lastOrderAt: '2024-01-09T14:00:00Z',
    totalSpent: 1250,
    ordersCount: 4,
  },
  {
    id: 'c2',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    status: 'waiting',
    lastOrderAt: '2024-01-05T10:00:00Z',
    totalSpent: 280,
    ordersCount: 1,
  },
  {
    id: 'c3',
    name: 'Pedro Costa',
    email: 'pedro.costa@email.com',
    status: 'active',
    lastOrderAt: '2024-01-09T14:00:00Z',
    totalSpent: 2340,
    ordersCount: 7,
  },
  {
    id: 'c4',
    name: 'Ana Oliveira',
    email: 'ana.oliveira@email.com',
    status: 'active',
    lastOrderAt: '2024-01-10T08:00:00Z',
    totalSpent: 890,
    ordersCount: 3,
  },
  {
    id: 'c5',
    name: 'Lucas Ferreira',
    email: 'lucas.ferreira@email.com',
    status: 'waiting',
    lastOrderAt: '2024-01-10T09:00:00Z',
    totalSpent: 890,
    ordersCount: 1,
  },
  {
    id: 'c6',
    name: 'Fernanda Lima',
    email: 'fernanda.lima@email.com',
    status: 'inactive',
    lastOrderAt: '2023-11-20T11:00:00Z',
    totalSpent: 450,
    ordersCount: 2,
  },
  {
    id: 'c7',
    name: 'Ricardo Alves',
    email: 'ricardo.alves@email.com',
    status: 'active',
    lastOrderAt: '2024-01-10T14:00:00Z',
    totalSpent: 1680,
    ordersCount: 5,
  },
  {
    id: 'c8',
    name: 'Carla Mendes',
    email: 'carla.mendes@email.com',
    status: 'active',
    lastOrderAt: '2024-01-10T15:00:00Z',
    totalSpent: 320,
    ordersCount: 2,
  },
  {
    id: 'c9',
    name: 'Marcos Souza',
    email: 'marcos.souza@email.com',
    status: 'waiting',
    lastOrderAt: '2024-01-07T10:00:00Z',
    totalSpent: 750,
    ordersCount: 1,
  },
]

const customerDetailsData: Record<string, CustomerDetail> = {
  c1: { ...customersData[0], phone: '(11) 99999-1234', createdAt: '2023-06-15T10:00:00Z' },
  c2: { ...customersData[1], phone: '(11) 98888-5678', createdAt: '2023-09-20T14:00:00Z' },
  c3: { ...customersData[2], phone: '(11) 97777-9012', createdAt: '2023-03-10T09:00:00Z' },
  c4: { ...customersData[3], phone: '(11) 96666-3456', createdAt: '2023-11-05T11:00:00Z' },
  c5: { ...customersData[4], phone: '(11) 95555-7890', createdAt: '2024-01-02T16:00:00Z' },
  c6: { ...customersData[5], phone: '(11) 94444-1234', createdAt: '2023-08-25T10:00:00Z' },
  c7: { ...customersData[6], phone: '(11) 93333-5678', createdAt: '2023-05-12T15:00:00Z' },
  c8: { ...customersData[7], phone: '(11) 92222-9012', createdAt: '2023-12-01T09:00:00Z' },
  c9: { ...customersData[8], phone: '(11) 91111-3456', createdAt: '2023-10-18T14:00:00Z' },
}

const customerOrdersData: Record<string, Order[]> = {
  c1: [
    { id: '1', status: 'ready', promisedAt: '2024-01-10T16:00:00Z', createdAt: '2024-01-08T09:00:00Z', total: 450, customerName: 'João Silva', bikeLabel: 'Caloi Elite 2.4', serviceSummary: 'Revisão geral', notified: false },
    { id: '10', status: 'ready', promisedAt: '2023-12-15T14:00:00Z', createdAt: '2023-12-12T10:00:00Z', total: 280, customerName: 'João Silva', bikeLabel: 'Caloi Elite 2.4', serviceSummary: 'Troca de pneu', notified: true },
    { id: '11', status: 'ready', promisedAt: '2023-10-20T11:00:00Z', createdAt: '2023-10-18T09:00:00Z', total: 320, customerName: 'João Silva', bikeLabel: 'Caloi Elite 2.4', serviceSummary: 'Ajuste de câmbio', notified: true },
    { id: '12', status: 'ready', promisedAt: '2023-08-05T16:00:00Z', createdAt: '2023-08-02T14:00:00Z', total: 200, customerName: 'João Silva', bikeLabel: 'Caloi Elite 2.4', serviceSummary: 'Troca de corrente', notified: true },
  ],
  c2: [
    { id: '2', status: 'ready', promisedAt: '2024-01-10T17:00:00Z', createdAt: '2024-01-09T10:00:00Z', total: 280, customerName: 'Maria Santos', bikeLabel: 'Trek Marlin 7', serviceSummary: 'Troca de pneu', notified: true },
  ],
  c3: [
    { id: '3', status: 'in_progress', promisedAt: '2024-01-11T10:00:00Z', createdAt: '2024-01-09T14:00:00Z', total: 620, customerName: 'Pedro Costa', bikeLabel: 'Specialized Rockhopper', serviceSummary: 'Manutenção freios + câmbio', notified: false },
    { id: '13', status: 'ready', promisedAt: '2023-12-20T10:00:00Z', createdAt: '2023-12-18T09:00:00Z', total: 450, customerName: 'Pedro Costa', bikeLabel: 'Specialized Rockhopper', serviceSummary: 'Revisão completa', notified: true },
    { id: '14', status: 'ready', promisedAt: '2023-11-10T14:00:00Z', createdAt: '2023-11-08T11:00:00Z', total: 380, customerName: 'Pedro Costa', bikeLabel: 'Specialized Rockhopper', serviceSummary: 'Troca de suspensão', notified: true },
    { id: '15', status: 'ready', promisedAt: '2023-09-25T16:00:00Z', createdAt: '2023-09-22T10:00:00Z', total: 290, customerName: 'Pedro Costa', bikeLabel: 'Specialized Rockhopper', serviceSummary: 'Sangria de freios', notified: true },
    { id: '16', status: 'ready', promisedAt: '2023-07-15T11:00:00Z', createdAt: '2023-07-12T09:00:00Z', total: 200, customerName: 'Pedro Costa', bikeLabel: 'Specialized Rockhopper', serviceSummary: 'Centragem de rodas', notified: true },
    { id: '17', status: 'ready', promisedAt: '2023-05-20T14:00:00Z', createdAt: '2023-05-18T10:00:00Z', total: 220, customerName: 'Pedro Costa', bikeLabel: 'Specialized Rockhopper', serviceSummary: 'Troca de cassete', notified: true },
    { id: '18', status: 'ready', promisedAt: '2023-03-30T16:00:00Z', createdAt: '2023-03-28T11:00:00Z', total: 180, customerName: 'Pedro Costa', bikeLabel: 'Specialized Rockhopper', serviceSummary: 'Lubrificação', notified: true },
  ],
  c4: [
    { id: '4', status: 'in_progress', promisedAt: '2024-01-11T14:00:00Z', createdAt: '2024-01-10T08:00:00Z', total: 150, customerName: 'Ana Oliveira', bikeLabel: 'Sense Impact Pro', serviceSummary: 'Ajuste de câmbio', notified: false },
    { id: '19', status: 'ready', promisedAt: '2023-12-05T10:00:00Z', createdAt: '2023-12-03T09:00:00Z', total: 420, customerName: 'Ana Oliveira', bikeLabel: 'Sense Impact Pro', serviceSummary: 'Revisão geral', notified: true },
    { id: '20', status: 'ready', promisedAt: '2023-11-20T14:00:00Z', createdAt: '2023-11-18T10:00:00Z', total: 320, customerName: 'Ana Oliveira', bikeLabel: 'Sense Impact Pro', serviceSummary: 'Troca de freios', notified: true },
  ],
  c5: [
    { id: '5', status: 'waiting', promisedAt: '2024-01-12T09:00:00Z', createdAt: '2024-01-10T09:00:00Z', total: 890, customerName: 'Lucas Ferreira', bikeLabel: 'Scott Scale 970', serviceSummary: 'Suspensão + Revisão completa', notified: false },
  ],
  c6: [
    { id: '21', status: 'ready', promisedAt: '2023-11-22T11:00:00Z', createdAt: '2023-11-20T11:00:00Z', total: 250, customerName: 'Fernanda Lima', bikeLabel: 'Oggi 7.0', serviceSummary: 'Troca de corrente', notified: true },
    { id: '22', status: 'ready', promisedAt: '2023-09-10T14:00:00Z', createdAt: '2023-09-08T10:00:00Z', total: 200, customerName: 'Fernanda Lima', bikeLabel: 'Oggi 7.0', serviceSummary: 'Ajuste geral', notified: true },
  ],
  c7: [
    { id: '7', status: 'waiting', promisedAt: '2024-01-12T16:00:00Z', createdAt: '2024-01-10T14:00:00Z', total: 180, customerName: 'Ricardo Alves', bikeLabel: 'Cannondale Trail', serviceSummary: 'Centragem de rodas', notified: false },
    { id: '23', status: 'ready', promisedAt: '2023-12-28T10:00:00Z', createdAt: '2023-12-26T09:00:00Z', total: 450, customerName: 'Ricardo Alves', bikeLabel: 'Cannondale Trail', serviceSummary: 'Revisão completa', notified: true },
    { id: '24', status: 'ready', promisedAt: '2023-11-15T14:00:00Z', createdAt: '2023-11-13T10:00:00Z', total: 380, customerName: 'Ricardo Alves', bikeLabel: 'Cannondale Trail', serviceSummary: 'Troca de pneus', notified: true },
    { id: '25', status: 'ready', promisedAt: '2023-09-20T11:00:00Z', createdAt: '2023-09-18T09:00:00Z', total: 350, customerName: 'Ricardo Alves', bikeLabel: 'Cannondale Trail', serviceSummary: 'Freios + Câmbio', notified: true },
    { id: '26', status: 'ready', promisedAt: '2023-07-05T16:00:00Z', createdAt: '2023-07-03T10:00:00Z', total: 320, customerName: 'Ricardo Alves', bikeLabel: 'Cannondale Trail', serviceSummary: 'Suspensão', notified: true },
  ],
  c8: [
    { id: '8', status: 'ready', promisedAt: '2024-01-10T18:00:00Z', createdAt: '2024-01-10T15:00:00Z', total: 95, customerName: 'Carla Mendes', bikeLabel: 'Groove Hype 50', serviceSummary: 'Troca de câmara', notified: false },
    { id: '27', status: 'ready', promisedAt: '2023-12-20T14:00:00Z', createdAt: '2023-12-18T10:00:00Z', total: 225, customerName: 'Carla Mendes', bikeLabel: 'Groove Hype 50', serviceSummary: 'Ajuste geral', notified: true },
  ],
  c9: [
    { id: '9', status: 'in_progress', promisedAt: '2024-01-09T18:00:00Z', createdAt: '2024-01-07T10:00:00Z', total: 750, customerName: 'Marcos Souza', bikeLabel: 'Giant Talon 2', serviceSummary: 'Revisão completa + troca de componentes', notified: false },
  ],
}

export const customers = {
  list: async (): Promise<CustomerListItem[]> => {
    await new Promise((res) => setTimeout(res, 500))
    return customersData
  },

  getById: async (id: string): Promise<CustomerDetail | null> => {
    await new Promise((res) => setTimeout(res, 300))
    return customerDetailsData[id] || null
  },

  ordersByCustomer: async (customerId: string): Promise<Order[]> => {
    await new Promise((res) => setTimeout(res, 400))
    return customerOrdersData[customerId] || []
  },
}
