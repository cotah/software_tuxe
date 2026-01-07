// ============================================
// BTRIX - Type Definitions
// ============================================

// Base types
export type ID = string

// Order Status (stages in the workshop)
export type OrderStatus =
  | 'received'
  | 'diagnosing'
  | 'waiting_approval'
  | 'in_progress'
  | 'ready'
  | 'delivered'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: 'Recebidas',
  diagnosing: 'Em Diagnóstico',
  waiting_approval: 'Aguardando Aprovação',
  in_progress: 'Em Execução',
  ready: 'Prontas',
  delivered: 'Entregues',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  received: 'bg-gray-100 text-gray-700',
  diagnosing: 'bg-blue-100 text-blue-700',
  waiting_approval: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-indigo-100 text-indigo-700',
  ready: 'bg-green-100 text-green-700',
  delivered: 'bg-gray-100 text-gray-500',
}

// Inventory status
export type InventoryStatus = 'ok' | 'low' | 'zero'

// Alert severity
export type AlertSeverity = 'warning' | 'error' | 'info'

// ============================================
// Entities
// ============================================

export interface Customer {
  id: ID
  name: string
  phone: string
  email?: string
  createdAt: string
  lastVisit?: string
  totalOrders: number
  totalSpent: number
  bikes: Bike[]
  // AI-generated summary
  aiSummary?: string
}

export interface Bike {
  id: ID
  customerId: ID
  brand: string
  model: string
  color?: string
  year?: number
  wheelSize?: string
}

export interface ServiceItem {
  id: ID
  name: string
  price: number
  completed: boolean
  partId?: ID
  partName?: string
  partStock?: InventoryStatus
}

export interface Order {
  id: ID
  orderNumber: number
  customerId: ID
  customerName: string
  bikeId: ID
  bikeName: string
  status: OrderStatus
  services: ServiceItem[]
  totalValue: number
  notes?: string
  estimatedDelivery?: string
  createdAt: string
  updatedAt: string
  // Timeline of events
  timeline: OrderEvent[]
  // Is customer notified about completion?
  customerNotified: boolean
  // Is this order overdue?
  isOverdue: boolean
  daysInCurrentStatus: number
}

export interface OrderEvent {
  id: ID
  orderId: ID
  type: 'created' | 'status_changed' | 'note_added' | 'customer_notified' | 'service_completed'
  description: string
  createdAt: string
  createdBy?: string
}

export interface InventoryItem {
  id: ID
  name: string
  sku?: string
  quantity: number
  minQuantity: number
  cost: number
  category?: string
  status: InventoryStatus
  // How many times used recently
  recentUsage: number
  // Related service types
  relatedServices?: string[]
}

export interface Conversation {
  id: ID
  customerId: ID
  messages: Message[]
  lastMessageAt: string
  unreadCount: number
}

export interface Message {
  id: ID
  conversationId: ID
  direction: 'inbound' | 'outbound'
  content: string
  createdAt: string
  // AI suggestion for reply
  aiSuggestion?: string
}

// ============================================
// Dashboard / Command Center
// ============================================

export interface DashboardStats {
  inProgress: number
  waiting: number
  readyForDelivery: number
  pendingDeliveryValue: number
}

export interface Alert {
  id: ID
  type: 'order_overdue' | 'customer_no_response' | 'inventory_critical' | 'hot_lead'
  severity: AlertSeverity
  title: string
  description: string
  entityId: ID
  entityType: 'order' | 'customer' | 'inventory'
  createdAt: string
}

export interface TimelineEvent {
  id: ID
  time: string
  type: 'order' | 'delivery' | 'appointment' | 'followup'
  title: string
  subtitle?: string
  status: 'past' | 'current' | 'upcoming'
  hasWarning?: boolean
}

export interface UpcomingDelivery {
  id: ID
  customerName: string
  bikeName: string
  serviceSummary: string
  value: number
  deliveryDate: string
  isToday: boolean
  customerNotified: boolean
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: ID
    name: string
    email: string
    shopName: string
  }
}

// ============================================
// UI State Types
// ============================================

export interface CommandAction {
  id: string
  label: string
  description?: string
  icon?: string
  shortcut?: string
  action: () => void
  category: 'navigation' | 'action' | 'search'
}
