'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Mock events
const MOCK_EVENTS = [
  { id: '1', title: 'Revisão - Pedro', time: '09:00', type: 'appointment' },
  { id: '2', title: 'Entrega - João', time: '14:00', type: 'delivery' },
  { id: '3', title: 'Diagnóstico - Maria', time: '16:00', type: 'appointment' },
]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week')

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const hours = Array.from({ length: 11 }, (_, i) => i + 8) // 8am to 6pm

  // Get week dates
  const getWeekDates = () => {
    const start = new Date(currentDate)
    start.setDate(start.getDate() - start.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start)
      date.setDate(date.getDate() + i)
      return date
    })
  }

  const weekDates = getWeekDates()
  const today = new Date()

  const formatMonthYear = (date: Date) =>
    date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const goToPrevWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentDate(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentDate(newDate)
  }

  const isToday = (date: Date) =>
    date.toDateString() === today.toDateString()

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-surface-secondary border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-heading text-text-primary">Agenda</h1>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon-sm" onClick={goToPrevWeek}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium text-text-primary min-w-[180px] text-center capitalize">
                  {formatMonthYear(currentDate)}
                </span>
                <Button variant="ghost" size="icon-sm" onClick={goToNextWeek}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1 p-1 bg-white rounded-lg border border-border">
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    viewMode === 'week'
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Semana
                </button>
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    viewMode === 'day'
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Dia
                </button>
              </div>

              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Agendar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-4 h-full">
          <Card className="h-full overflow-hidden">
            <CardContent className="p-0 h-full overflow-auto">
              <div className="min-w-[800px]">
                {/* Day Headers */}
                <div className="grid grid-cols-8 border-b border-border sticky top-0 bg-white z-10">
                  <div className="p-3 text-xs text-text-tertiary">Horário</div>
                  {weekDates.map((date, i) => (
                    <div
                      key={i}
                      className={cn(
                        'p-3 text-center border-l border-border',
                        isToday(date) && 'bg-brand-50'
                      )}
                    >
                      <div className="text-xs text-text-tertiary">
                        {weekDays[date.getDay()]}
                      </div>
                      <div
                        className={cn(
                          'text-lg font-semibold mt-0.5',
                          isToday(date) ? 'text-brand-600' : 'text-text-primary'
                        )}
                      >
                        {date.getDate()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time Grid */}
                {hours.map((hour) => (
                  <div key={hour} className="grid grid-cols-8 border-b border-border">
                    <div className="p-3 text-xs text-text-tertiary">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    {weekDates.map((date, i) => (
                      <div
                        key={i}
                        className={cn(
                          'p-1 min-h-[60px] border-l border-border hover:bg-surface-secondary cursor-pointer transition-colors',
                          isToday(date) && 'bg-brand-50/30'
                        )}
                      >
                        {/* Mock event */}
                        {isToday(date) && hour === 14 && (
                          <div className="bg-brand-500 text-white text-xs rounded px-2 py-1">
                            <div className="font-medium">Entrega - João</div>
                            <div className="opacity-70">14:00</div>
                          </div>
                        )}
                        {isToday(date) && hour === 9 && (
                          <div className="bg-green-500 text-white text-xs rounded px-2 py-1">
                            <div className="font-medium">Revisão - Pedro</div>
                            <div className="opacity-70">09:00</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
