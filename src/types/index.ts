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
