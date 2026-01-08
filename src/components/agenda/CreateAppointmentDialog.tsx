'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AppointmentType, AppointmentStatus } from '@/types'

interface FormData {
  title: string
  type: AppointmentType
  startTime: string
  endTime: string
  customerName: string
  orderId: string
  notes: string
  status: AppointmentStatus
}

interface FormErrors {
  title?: string
  startTime?: string
  endTime?: string
  timeRange?: string
}

interface CreateAppointmentDialogProps {
  selectedDate: string
  onSubmit: (data: {
    title: string
    type: AppointmentType
    startAt: string
    endAt: string
    customerName?: string
    orderId?: string
    notes?: string
    status: AppointmentStatus
  }) => void
  isPending: boolean
}

const appointmentTypes: { value: AppointmentType; label: string }[] = [
  { value: 'dropoff', label: 'Recebimento' },
  { value: 'pickup', label: 'Entrega' },
  { value: 'review', label: 'Revisão' },
  { value: 'call', label: 'Ligação' },
]

const appointmentStatuses: { value: AppointmentStatus; label: string }[] = [
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'pending', label: 'Pendente' },
]

function getDefaultStartTime(): string {
  const now = new Date()
  const hours = now.getHours()
  const nextHour = Math.min(Math.max(hours + 1, 8), 17)
  return `${nextHour.toString().padStart(2, '0')}:00`
}

function getDefaultEndTime(): string {
  const now = new Date()
  const hours = now.getHours()
  const nextHour = Math.min(Math.max(hours + 2, 9), 18)
  return `${nextHour.toString().padStart(2, '0')}:00`
}

export function CreateAppointmentDialog({
  selectedDate,
  onSubmit,
  isPending,
}: CreateAppointmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    type: 'dropoff',
    startTime: getDefaultStartTime(),
    endTime: getDefaultEndTime(),
    customerName: '',
    orderId: '',
    notes: '',
    status: 'confirmed',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'dropoff',
      startTime: getDefaultStartTime(),
      endTime: getDefaultEndTime(),
      customerName: '',
      orderId: '',
      notes: '',
      status: 'confirmed',
    })
    setErrors({})
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório'
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Horário de início é obrigatório'
    }

    if (!formData.endTime) {
      newErrors.endTime = 'Horário de término é obrigatório'
    }

    if (formData.startTime && formData.endTime) {
      const [startH, startM] = formData.startTime.split(':').map(Number)
      const [endH, endM] = formData.endTime.split(':').map(Number)
      const startMinutes = startH * 60 + startM
      const endMinutes = endH * 60 + endM

      if (endMinutes <= startMinutes) {
        newErrors.timeRange = 'Horário de término deve ser após o início'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const startAt = `${selectedDate}T${formData.startTime}:00.000Z`
    const endAt = `${selectedDate}T${formData.endTime}:00.000Z`

    onSubmit({
      title: formData.title.trim(),
      type: formData.type,
      startAt,
      endAt,
      customerName: formData.customerName.trim() || undefined,
      orderId: formData.orderId.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      status: formData.status,
    })

    resetForm()
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      resetForm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo agendamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
          <DialogDescription>
            Criar um novo compromisso para{' '}
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Título <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Ex: Revisão da bike do João"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value: AppointmentType) =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: AppointmentStatus) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {appointmentStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">
                Início <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, startTime: e.target.value }))
                }
                min="08:00"
                max="17:00"
                className={errors.startTime || errors.timeRange ? 'border-red-500' : ''}
              />
              {errors.startTime && (
                <p className="text-xs text-red-500">{errors.startTime}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">
                Término <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endTime: e.target.value }))
                }
                min="09:00"
                max="18:00"
                className={errors.endTime || errors.timeRange ? 'border-red-500' : ''}
              />
              {errors.endTime && (
                <p className="text-xs text-red-500">{errors.endTime}</p>
              )}
            </div>
          </div>

          {errors.timeRange && (
            <p className="text-xs text-red-500">{errors.timeRange}</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="customerName">Nome do Cliente</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, customerName: e.target.value }))
              }
              placeholder="Ex: João da Silva"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderId">ID da OS (opcional)</Label>
            <Input
              id="orderId"
              value={formData.orderId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, orderId: e.target.value }))
              }
              placeholder="Ex: os-001"
            />
            <p className="text-xs text-muted-foreground">
              Se informado, o agendamento será vinculado à OS
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Anotações adicionais..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Criando...' : 'Criar agendamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
