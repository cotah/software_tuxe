'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppointments, useCreateAppointment } from '@/hooks/useDataHooks'
import { DayAgendaTimeline } from './DayAgendaTimeline'
import { AppointmentsList } from './AppointmentsList'
import { CreateAppointmentDialog } from './CreateAppointmentDialog'
import { CalendarIntegrationCard } from './CalendarIntegrationCard'
import { Appointment, AppointmentType, AppointmentStatus } from '@/types'

type ViewMode = 'day' | 'week'

function formatDateHeader(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00')
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatShortDate(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00')
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  })
}

function getToday(): string {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

function addDays(dateString: string, days: number): string {
  const date = new Date(dateString + 'T12:00:00')
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

function getWeekDays(startDate: string): string[] {
  const days: string[] = []
  for (let i = 0; i < 7; i++) {
    days.push(addDays(startDate, i))
  }
  return days
}

function getStartOfWeek(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00')
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  return date.toISOString().split('T')[0]
}

function isToday(dateString: string): boolean {
  return dateString === getToday()
}

export function AgendaView() {
  const [selectedDate, setSelectedDate] = useState(getToday)
  const [viewMode, setViewMode] = useState<ViewMode>('day')

  const { data: appointments = [], isLoading } = useAppointments(selectedDate)
  const createMutation = useCreateAppointment(selectedDate)

  const handlePrevious = () => {
    if (viewMode === 'day') {
      setSelectedDate((prev) => addDays(prev, -1))
    } else {
      setSelectedDate((prev) => addDays(getStartOfWeek(prev), -7))
    }
  }

  const handleNext = () => {
    if (viewMode === 'day') {
      setSelectedDate((prev) => addDays(prev, 1))
    } else {
      setSelectedDate((prev) => addDays(getStartOfWeek(prev), 7))
    }
  }

  const handleToday = () => {
    setSelectedDate(getToday())
  }

  const handleCreateAppointment = (data: {
    title: string
    type: AppointmentType
    startAt: string
    endAt: string
    customerName?: string
    orderId?: string
    notes?: string
    status: AppointmentStatus
  }) => {
    createMutation.mutate(data as Omit<Appointment, 'id'>)
  }

  const weekDays = viewMode === 'week' ? getWeekDays(getStartOfWeek(selectedDate)) : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CalendarIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Agenda</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie seus compromissos e agendamentos
            </p>
          </div>
        </div>

        <CreateAppointmentDialog
          selectedDate={selectedDate}
          onSubmit={handleCreateAppointment}
          isPending={createMutation.isPending}
        />
      </div>

      {/* Navigation & Controls */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              aria-label={viewMode === 'day' ? 'Dia anterior' : 'Semana anterior'}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              disabled={isToday(selectedDate)}
            >
              Hoje
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              aria-label={viewMode === 'day' ? 'Próximo dia' : 'Próxima semana'}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <span className="ml-2 text-sm font-medium capitalize">
              {viewMode === 'day'
                ? formatDateHeader(selectedDate)
                : `${formatShortDate(weekDays[0])} - ${formatShortDate(weekDays[6])}`}
            </span>
          </div>

          <Tabs
            value={viewMode}
            onValueChange={(value) => setViewMode(value as ViewMode)}
          >
            <TabsList>
              <TabsTrigger value="day">Dia</TabsTrigger>
              <TabsTrigger value="week">Semana</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </Card>

      {/* Week View - Day Selector */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const date = new Date(day + 'T12:00:00')
            const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' })
            const dayNum = date.getDate()
            const isSelected = day === selectedDate
            const isTodayDate = isToday(day)

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDate(day)}
                className={`
                  p-3 rounded-lg text-center transition-colors border
                  ${isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : isTodayDate
                      ? 'bg-primary/10 border-primary/30 hover:bg-primary/20'
                      : 'bg-card border-border hover:bg-muted'
                  }
                `}
              >
                <p className="text-xs uppercase font-medium opacity-70">{dayName}</p>
                <p className="text-lg font-semibold">{dayNum}</p>
              </button>
            )
          })}
        </div>
      )}

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
        {/* Timeline */}
        <div className="order-2 lg:order-1">
          <DayAgendaTimeline appointments={appointments} isLoading={isLoading} />
        </div>

        {/* Sidebar */}
        <div className="order-1 lg:order-2 space-y-6">
          <AppointmentsList appointments={appointments} isLoading={isLoading} />
          <CalendarIntegrationCard />
        </div>
      </div>
    </div>
  )
}
