export type OrderStatus = 'in_progress' | 'waiting' | 'ready'

export type ServiceItem = {
  id: string
  name: string
  price: number
  quantity: number
}

export type Customer = {
  id: string
  name: string
  email: string
  phone: string
}

export type CustomerStatus = 'active' | 'waiting' | 'inactive'

export type CustomerListItem = {
  id: string
  name: string
  email: string
  status: CustomerStatus
  lastOrderAt: string
  totalSpent: number
  ordersCount: number
}

export type CustomerDetail = CustomerListItem & {
  phone: string
  createdAt: string
}

export type Bike = {
  id: string
  brand: string
  model: string
  color: string
  year?: number
}

export type Order = {
  id: string
  status: OrderStatus
  promisedAt: string
  createdAt: string
  total: number
  customerName: string
  bikeLabel: string
  serviceSummary: string
  notified: boolean
  customer?: Customer
  bike?: Bike
  services?: ServiceItem[]
  notes?: string
}

export type OrderDetail = Order & {
  customer: Customer
  bike: Bike
  services: ServiceItem[]
}

export type AlertItem = {
  id: string
  severity: 'critical' | 'warning' | 'info'
  message: string
  context: string
  ctaLabel: string
  ctaHref: string
}

export type TimelineEvent = {
  id: string
  time: string
  label: string
  type: 'delivery' | 'appointment' | 'followup' | 'deadline'
  href: string
  severity?: 'warning'
}

export type Insight = {
  id: string
  message: string
  actions: {
    label: string
    action: 'ignore' | 'mark_to_buy'
  }[]
}

export type Money = {
  amount: number
  currency: 'BRL'
}

export type AnalyticsRange = '7d' | '30d' | '90d'

export type AnalyticsChannel = 'walk-in' | 'whatsapp' | 'instagram' | 'partner'

export type AnalyticsOrderStatus = 'ready' | 'in_progress' | 'waiting' | 'delayed'

export type AnalyticsKpis = {
  revenue: number
  orders: number
  avgTicket: number
  avgLeadTimeMin: number
  delayedCount: number
}

export type RevenuePoint = {
  date: string
  revenue: number
}

export type StatusBreakdown = {
  status: AnalyticsOrderStatus
  count: number
}

export type TopServiceItem = {
  name: string
  count: number
  revenue: number
  avgTicket: number
}

export type AnalyticsSummary = {
  kpis: AnalyticsKpis
  revenueSeries: RevenuePoint[]
  statusBreakdown: StatusBreakdown[]
  topServices: TopServiceItem[]
}

export type AnalyticsOrder = {
  id: string
  status: AnalyticsOrderStatus
  total: number
  serviceName: string
  createdAt: string
  deliveredAt?: string
  channel: AnalyticsChannel
}

export type AppointmentType = 'dropoff' | 'pickup' | 'review' | 'call'

export type AppointmentStatus = 'confirmed' | 'pending' | 'canceled'

export type Appointment = {
  id: string
  title: string
  type: AppointmentType
  startAt: string
  endAt: string
  customerId?: string
  customerName?: string
  orderId?: string
  notes?: string
  status?: AppointmentStatus
}

export type CalendarProvider = 'google' | 'outlook' | 'calendly' | 'native'

export type CalendarConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'syncing'
  | 'needs_reauth'
  | 'error'

export type CalendarConnection = {
  id: string
  provider: CalendarProvider
  status: CalendarConnectionStatus
  accountLabel?: string
  lastSyncedAt?: string
  errorMessage?: string
}

// Inventory Types
export type InventoryStatus = 'ok' | 'low' | 'out'

export type InventoryItem = {
  id: string
  name: string
  sku: string
  category: string
  qty: number
  minQty: number
  unitCost: number
  unitPrice?: number
  location?: string
  updatedAt: string
}

export type StockMovementType = 'in' | 'out' | 'adjust'

export type StockMovement = {
  id: string
  itemId: string
  type: StockMovementType
  qty: number
  note?: string
  createdAt: string
  createdBy: string
}
