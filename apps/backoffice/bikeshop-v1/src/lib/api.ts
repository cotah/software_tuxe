import { delay } from './utils'
import type {
  Order,
  Customer,
  InventoryItem,
  DashboardStats,
  Alert,
  TimelineEvent,
  UpcomingDelivery,
  LoginRequest,
  LoginResponse,
  Conversation,
  Message,
  ApiResponse,
} from '@/types'

// ============================================
// API Client Configuration
// ============================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true'

async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return { data, success: true }
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error)
    return {
      data: null as T,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================
// Mock Data
// ============================================

const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: 42,
    customerId: '1',
    customerName: 'João Silva',
    bikeId: '1',
    bikeName: 'Specialized Speed',
    status: 'in_progress',
    services: [
      { id: '1', name: 'Revisão completa', price: 180, completed: true },
      { id: '2', name: 'Troca de câmara traseira', price: 45, completed: false, partId: '1', partName: 'Câmara Pirelli 29"', partStock: 'ok' },
      { id: '3', name: 'Troca de cabo de freio', price: 55, completed: false, partId: '2', partName: 'Cabo Shimano', partStock: 'ok' },
    ],
    totalValue: 280,
    notes: 'Cliente pediu pra checar barulho no pedivela também',
    estimatedDelivery: new Date().toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: [
      { id: '1', orderId: '1', type: 'created', description: 'OS criada por Carlos', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: '2', orderId: '1', type: 'status_changed', description: 'Diagnóstico: câmara furada + cabo gasto', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000).toISOString() },
      { id: '3', orderId: '1', type: 'customer_notified', description: 'Orçamento enviado ao cliente (R$280)', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5400000).toISOString() },
      { id: '4', orderId: '1', type: 'status_changed', description: 'Cliente aprovou via WhatsApp', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { id: '5', orderId: '1', type: 'status_changed', description: 'Execução iniciada', createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
    ],
    customerNotified: false,
    isOverdue: false,
    daysInCurrentStatus: 0,
  },
  {
    id: '2',
    orderNumber: 45,
    customerId: '2',
    customerName: 'Carlos Mendes',
    bikeId: '2',
    bikeName: 'Trek MTB',
    status: 'diagnosing',
    services: [
      { id: '4', name: 'Revisão completa', price: 180, completed: false },
    ],
    totalValue: 180,
    estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: [
      { id: '6', orderId: '2', type: 'created', description: 'OS criada', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    ],
    customerNotified: false,
    isOverdue: true,
    daysInCurrentStatus: 1,
  },
  {
    id: '3',
    orderNumber: 38,
    customerId: '3',
    customerName: 'Maria Costa',
    bikeId: '3',
    bikeName: 'Caloi MTB',
    status: 'waiting_approval',
    services: [
      { id: '5', name: 'Troca de corrente', price: 120, completed: false, partId: '3', partName: 'Corrente Shimano HG', partStock: 'zero' },
    ],
    totalValue: 120,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    timeline: [
      { id: '7', orderId: '3', type: 'created', description: 'OS criada', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { id: '8', orderId: '3', type: 'customer_notified', description: 'Orçamento enviado', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    customerNotified: true,
    isOverdue: true,
    daysInCurrentStatus: 2,
  },
  {
    id: '4',
    orderNumber: 40,
    customerId: '4',
    customerName: 'Ana Costa',
    bikeId: '4',
    bikeName: 'Trek Marlin',
    status: 'ready',
    services: [
      { id: '6', name: 'Regulagem de marcha', price: 80, completed: true },
      { id: '7', name: 'Ajuste de freios', price: 40, completed: true },
    ],
    totalValue: 120,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    timeline: [],
    customerNotified: true,
    isOverdue: false,
    daysInCurrentStatus: 0,
  },
  {
    id: '5',
    orderNumber: 39,
    customerId: '5',
    customerName: 'Pedro Souza',
    bikeId: '5',
    bikeName: 'Oggi MTB',
    status: 'ready',
    services: [
      { id: '8', name: 'Troca de pneus', price: 200, completed: true },
    ],
    totalValue: 200,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    timeline: [],
    customerNotified: false,
    isOverdue: false,
    daysInCurrentStatus: 1,
  },
  {
    id: '6',
    orderNumber: 48,
    customerId: '6',
    customerName: 'Roberto Lima',
    bikeId: '6',
    bikeName: 'Caloi Elite',
    status: 'received',
    services: [],
    totalValue: 0,
    notes: 'Barulho no pedal',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    timeline: [
      { id: '9', orderId: '6', type: 'created', description: 'OS criada', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    ],
    customerNotified: false,
    isOverdue: false,
    daysInCurrentStatus: 0,
  },
  {
    id: '7',
    orderNumber: 47,
    customerId: '7',
    customerName: 'Fernanda Alves',
    bikeId: '7',
    bikeName: 'Specialized Allez',
    status: 'received',
    services: [],
    totalValue: 0,
    notes: 'Revisão pré-prova',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    timeline: [],
    customerNotified: false,
    isOverdue: false,
    daysInCurrentStatus: 0,
  },
]

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: 'João Silva',
    phone: '(11) 99999-1234',
    email: 'joao@email.com',
    createdAt: '2024-03-15',
    lastVisit: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    totalOrders: 4,
    totalSpent: 850,
    bikes: [{ id: '1', customerId: '1', brand: 'Specialized', model: 'Speed', color: 'Prata', year: 2022, wheelSize: '29"' }],
    aiSummary: 'Cliente desde Mar/2024. 4 serviços realizados. Prefere revisão completa. Responde rápido via WhatsApp. Última visita: troca de corrente na Speed prata.',
  },
  {
    id: '2',
    name: 'Carlos Mendes',
    phone: '(11) 98888-5678',
    email: 'carlos.m@email.com',
    createdAt: '2024-01-10',
    lastVisit: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    totalOrders: 2,
    totalSpent: 320,
    bikes: [{ id: '2', customerId: '2', brand: 'Trek', model: 'MTB X-Caliber', color: 'Preto', year: 2023 }],
    aiSummary: 'Cliente novo, 2ª visita. Bike de alta performance. Costuma aprovar orçamentos rapidamente.',
  },
  {
    id: '3',
    name: 'Maria Costa',
    phone: '(11) 97777-9012',
    createdAt: '2023-08-20',
    lastVisit: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    totalOrders: 6,
    totalSpent: 1200,
    bikes: [{ id: '3', customerId: '3', brand: 'Caloi', model: 'MTB Explorer', color: 'Verde' }],
    aiSummary: 'Cliente frequente desde Ago/2023. 6 serviços. Demora um pouco para responder mensagens. Última visita teve problema com aprovação de orçamento.',
  },
  {
    id: '4',
    name: 'Ana Costa',
    phone: '(11) 96666-3456',
    email: 'ana.costa@email.com',
    createdAt: '2024-06-01',
    lastVisit: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    totalOrders: 1,
    totalSpent: 120,
    bikes: [{ id: '4', customerId: '4', brand: 'Trek', model: 'Marlin 7', color: 'Azul', year: 2024 }],
    aiSummary: 'Primeira visita. Bike nova, veio apenas para ajustes iniciais.',
  },
  {
    id: '5',
    name: 'Pedro Souza',
    phone: '(11) 95555-7890',
    createdAt: '2023-11-15',
    lastVisit: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    totalOrders: 3,
    totalSpent: 480,
    bikes: [{ id: '5', customerId: '5', brand: 'Oggi', model: 'Big Wheel 7.0', color: 'Vermelho' }],
    aiSummary: 'Cliente regular. Prefere peças de boa qualidade. Sempre paga à vista.',
  },
]

const MOCK_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Câmara Pirelli 26"', sku: 'CAM-PIR-26', quantity: 8, minQuantity: 5, cost: 25, category: 'Câmaras', status: 'ok', recentUsage: 3, relatedServices: ['Troca de câmara'] },
  { id: '2', name: 'Câmara Pirelli 29"', sku: 'CAM-PIR-29', quantity: 1, minQuantity: 5, cost: 28, category: 'Câmaras', status: 'low', recentUsage: 5, relatedServices: ['Troca de câmara'] },
  { id: '3', name: 'Corrente Shimano HG', sku: 'COR-SHI-HG', quantity: 0, minQuantity: 3, cost: 85, category: 'Transmissão', status: 'zero', recentUsage: 3, relatedServices: ['Troca de corrente'] },
  { id: '4', name: 'Cabo de freio Shimano', sku: 'CAB-FRE-SHI', quantity: 12, minQuantity: 5, cost: 15, category: 'Freios', status: 'ok', recentUsage: 4, relatedServices: ['Troca de cabo de freio'] },
  { id: '5', name: 'Pastilha de freio a disco', sku: 'PAS-FRE-DSC', quantity: 6, minQuantity: 8, cost: 45, category: 'Freios', status: 'low', recentUsage: 6, relatedServices: ['Troca de pastilha'] },
  { id: '6', name: 'Pneu Pirelli Scorpion 29"', sku: 'PNE-PIR-29', quantity: 4, minQuantity: 2, cost: 180, category: 'Pneus', status: 'ok', recentUsage: 2, relatedServices: ['Troca de pneu'] },
  { id: '7', name: 'Fita de aro 29"', sku: 'FIT-ARO-29', quantity: 10, minQuantity: 5, cost: 12, category: 'Acessórios', status: 'ok', recentUsage: 2, relatedServices: ['Revisão completa'] },
  { id: '8', name: 'Óleo lubrificante', sku: 'OLE-LUB-01', quantity: 3, minQuantity: 3, cost: 35, category: 'Lubrificação', status: 'low', recentUsage: 8, relatedServices: ['Revisão completa', 'Lubrificação'] },
]

const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    type: 'order_overdue',
    severity: 'warning',
    title: 'OS #38 atrasada',
    description: 'Aguardando aprovação há 2 dias',
    entityId: '3',
    entityType: 'order',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'customer_no_response',
    severity: 'warning',
    title: 'Maria Costa sem resposta',
    description: 'Última mensagem há 3 dias',
    entityId: '3',
    entityType: 'customer',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    type: 'inventory_critical',
    severity: 'error',
    title: 'Corrente Shimano HG zerada',
    description: 'Usada em 3 serviços este mês',
    entityId: '3',
    entityType: 'inventory',
    createdAt: new Date().toISOString(),
  },
]

const MOCK_TIMELINE: TimelineEvent[] = [
  { id: '1', time: '08:00', type: 'order', title: 'OS #48', subtitle: 'Roberto - Diagnóstico', status: 'past' },
  { id: '2', time: '09:30', type: 'order', title: 'OS #42', subtitle: 'João - Execução', status: 'current', hasWarning: false },
  { id: '3', time: '11:00', type: 'delivery', title: 'Entrega', subtitle: 'Ana Costa', status: 'upcoming' },
  { id: '4', time: '14:00', type: 'delivery', title: 'Entrega', subtitle: 'João Silva - R$280', status: 'upcoming' },
  { id: '5', time: '15:00', type: 'appointment', title: 'Agendamento', subtitle: 'Cliente novo', status: 'upcoming' },
  { id: '6', time: '16:30', type: 'followup', title: 'Follow-up', subtitle: 'Maria Costa', status: 'upcoming', hasWarning: true },
]

const MOCK_UPCOMING_DELIVERIES: UpcomingDelivery[] = [
  {
    id: '1',
    customerName: 'João Silva',
    bikeName: 'Specialized Speed',
    serviceSummary: 'Revisão completa + troca câmara',
    value: 280,
    deliveryDate: new Date().toISOString(),
    isToday: true,
    customerNotified: false,
  },
  {
    id: '4',
    customerName: 'Ana Costa',
    bikeName: 'Trek Marlin',
    serviceSummary: 'Regulagem de marcha',
    value: 120,
    deliveryDate: new Date().toISOString(),
    isToday: true,
    customerNotified: true,
  },
  {
    id: '5',
    customerName: 'Pedro Souza',
    bikeName: 'Oggi MTB',
    serviceSummary: 'Troca de pneus',
    value: 200,
    deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    isToday: false,
    customerNotified: false,
  },
]

const MOCK_CONVERSATIONS: Record<string, Message[]> = {
  '1': [
    { id: '1', conversationId: '1', direction: 'inbound', content: 'Opa, a bike já tá pronta?', createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString() },
    { id: '2', conversationId: '1', direction: 'outbound', content: 'Oi João! Tá sim, ficou show. Pode passar hoje até 18h', createdAt: new Date(Date.now() - 17.5 * 60 * 60 * 1000).toISOString() },
    { id: '3', conversationId: '1', direction: 'inbound', content: 'Beleza, vou passar às 17h', createdAt: new Date(Date.now() - 17 * 60 * 60 * 1000).toISOString() },
  ],
  '3': [
    { id: '4', conversationId: '3', direction: 'outbound', content: 'Oi Maria! Fiz o diagnóstico da sua bike. Vai precisar trocar a corrente, o orçamento ficou em R$120. Posso seguir?', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  ],
}

// ============================================
// API Functions
// ============================================

export const api = {
  // Auth
  auth: {
    login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
      if (USE_MOCKS) {
        await delay(500)
        // Mock: always succeed with demo credentials
        if (credentials.email === 'demo@btrix.com' && credentials.password === 'demo123') {
          return {
            success: true,
            data: {
              token: 'mock-jwt-token',
              user: {
                id: '1',
                name: 'Carlos',
                email: 'demo@btrix.com',
                shopName: 'Bike Shop do Carlos',
              },
            },
          }
        }
        return { success: false, data: null as unknown as LoginResponse, error: 'Credenciais inválidas' }
      }
      return apiClient<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })
    },
  },

  // Dashboard
  dashboard: {
    getStats: async (): Promise<ApiResponse<DashboardStats>> => {
      if (USE_MOCKS) {
        await delay(300)
        const inProgress = MOCK_ORDERS.filter(o => ['in_progress', 'diagnosing'].includes(o.status)).length
        const waiting = MOCK_ORDERS.filter(o => ['waiting_approval', 'received'].includes(o.status)).length
        const readyForDelivery = MOCK_ORDERS.filter(o => o.status === 'ready').length
        const pendingDeliveryValue = MOCK_ORDERS.filter(o => o.status === 'ready').reduce((sum, o) => sum + o.totalValue, 0)
        return { success: true, data: { inProgress, waiting, readyForDelivery, pendingDeliveryValue } }
      }
      return apiClient<DashboardStats>('/dashboard/stats')
    },

    getAlerts: async (): Promise<ApiResponse<Alert[]>> => {
      if (USE_MOCKS) {
        await delay(200)
        return { success: true, data: MOCK_ALERTS }
      }
      return apiClient<Alert[]>('/dashboard/alerts')
    },

    getTimeline: async (): Promise<ApiResponse<TimelineEvent[]>> => {
      if (USE_MOCKS) {
        await delay(200)
        return { success: true, data: MOCK_TIMELINE }
      }
      return apiClient<TimelineEvent[]>('/dashboard/timeline')
    },

    getUpcomingDeliveries: async (): Promise<ApiResponse<UpcomingDelivery[]>> => {
      if (USE_MOCKS) {
        await delay(200)
        return { success: true, data: MOCK_UPCOMING_DELIVERIES }
      }
      return apiClient<UpcomingDelivery[]>('/dashboard/upcoming-deliveries')
    },
  },

  // Orders
  orders: {
    list: async (): Promise<ApiResponse<Order[]>> => {
      if (USE_MOCKS) {
        await delay(400)
        return { success: true, data: MOCK_ORDERS }
      }
      return apiClient<Order[]>('/orders')
    },

    get: async (id: string): Promise<ApiResponse<Order | null>> => {
      if (USE_MOCKS) {
        await delay(300)
        const order = MOCK_ORDERS.find(o => o.id === id) || null
        return { success: true, data: order }
      }
      return apiClient<Order | null>(`/orders/${id}`)
    },

    updateStatus: async (id: string, status: string): Promise<ApiResponse<Order>> => {
      if (USE_MOCKS) {
        await delay(300)
        const order = MOCK_ORDERS.find(o => o.id === id)
        if (order) {
          order.status = status as Order['status']
          order.updatedAt = new Date().toISOString()
        }
        return { success: true, data: order! }
      }
      return apiClient<Order>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
    },
  },

  // Customers
  customers: {
    list: async (): Promise<ApiResponse<Customer[]>> => {
      if (USE_MOCKS) {
        await delay(400)
        return { success: true, data: MOCK_CUSTOMERS }
      }
      return apiClient<Customer[]>('/customers')
    },

    get: async (id: string): Promise<ApiResponse<Customer | null>> => {
      if (USE_MOCKS) {
        await delay(300)
        const customer = MOCK_CUSTOMERS.find(c => c.id === id) || null
        return { success: true, data: customer }
      }
      return apiClient<Customer | null>(`/customers/${id}`)
    },

    getConversation: async (customerId: string): Promise<ApiResponse<Message[]>> => {
      if (USE_MOCKS) {
        await delay(200)
        return { success: true, data: MOCK_CONVERSATIONS[customerId] || [] }
      }
      return apiClient<Message[]>(`/customers/${customerId}/conversation`)
    },

    getOrders: async (customerId: string): Promise<ApiResponse<Order[]>> => {
      if (USE_MOCKS) {
        await delay(200)
        const orders = MOCK_ORDERS.filter(o => o.customerId === customerId)
        return { success: true, data: orders }
      }
      return apiClient<Order[]>(`/customers/${customerId}/orders`)
    },
  },

  // Inventory
  inventory: {
    list: async (): Promise<ApiResponse<InventoryItem[]>> => {
      if (USE_MOCKS) {
        await delay(400)
        return { success: true, data: MOCK_INVENTORY }
      }
      return apiClient<InventoryItem[]>('/inventory')
    },

    updateQuantity: async (id: string, quantity: number): Promise<ApiResponse<InventoryItem>> => {
      if (USE_MOCKS) {
        await delay(300)
        const item = MOCK_INVENTORY.find(i => i.id === id)
        if (item) {
          item.quantity = quantity
          item.status = quantity === 0 ? 'zero' : quantity < item.minQuantity ? 'low' : 'ok'
        }
        return { success: true, data: item! }
      }
      return apiClient<InventoryItem>(`/inventory/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
      })
    },
  },
}

// Export a function to get AI suggestions (mock for now)
export async function getAiSuggestion(context: { customerId?: string; type: 'reply' | 'summary' }): Promise<string | null> {
  await delay(500)
  
  if (context.type === 'reply') {
    const customer = MOCK_CUSTOMERS.find(c => c.id === context.customerId)
    if (customer) {
      return `Oi ${customer.name.split(' ')[0]}! Sua bike está pronta, pode passar a qualquer momento. O valor final ficou R$280. Te espero!`
    }
  }
  
  return null
}
