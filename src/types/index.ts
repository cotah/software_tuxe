export type Order = {
  id: string
  status: 'in_progress' | 'waiting' | 'ready'
  promisedAt: string
  total: number
  customerName: string
  bikeLabel: string
  serviceSummary: string
  notified: boolean
}

export type Customer = {
  id: string
  name: string
  email: string
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
