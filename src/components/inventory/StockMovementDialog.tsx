'use client'

import { useState } from 'react'
import { ArrowDownCircle, ArrowUpCircle, Settings2 } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { StockMovementType } from '@/types'

interface StockMovementDialogProps {
  type: StockMovementType
  itemName: string
  currentQty: number
  currentMinQty: number
  onSubmit: (data: { qty: number; note?: string }) => void
  onUpdateMinQty?: (minQty: number) => void
  isPending: boolean
}

const typeConfig: Record<StockMovementType, { title: string; description: string; icon: typeof ArrowUpCircle; buttonLabel: string; buttonVariant: 'default' | 'destructive' | 'outline' }> = {
  in: {
    title: 'Entrada de Estoque',
    description: 'Adicionar unidades ao estoque',
    icon: ArrowDownCircle,
    buttonLabel: 'Entrada',
    buttonVariant: 'default',
  },
  out: {
    title: 'Saída de Estoque',
    description: 'Remover unidades do estoque',
    icon: ArrowUpCircle,
    buttonLabel: 'Saída',
    buttonVariant: 'destructive',
  },
  adjust: {
    title: 'Ajustar Mínimo',
    description: 'Definir a quantidade mínima de estoque',
    icon: Settings2,
    buttonLabel: 'Ajustar mínimo',
    buttonVariant: 'outline',
  },
}

export function StockMovementDialog({
  type,
  itemName,
  currentQty,
  currentMinQty,
  onSubmit,
  onUpdateMinQty,
  isPending,
}: StockMovementDialogProps) {
  const [open, setOpen] = useState(false)
  const [qty, setQty] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const config = typeConfig[type]
  const Icon = config.icon

  const resetForm = () => {
    setQty('')
    setNote('')
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const qtyNum = parseInt(qty, 10)

    if (isNaN(qtyNum) || qtyNum <= 0) {
      setError('Quantidade deve ser maior que zero')
      return
    }

    if (type === 'out' && qtyNum > currentQty) {
      setError(`Quantidade máxima disponível: ${currentQty}`)
      return
    }

    if (type === 'adjust' && onUpdateMinQty) {
      onUpdateMinQty(qtyNum)
    } else {
      onSubmit({ qty: qtyNum, note: note.trim() || undefined })
    }

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
        <Button variant={config.buttonVariant} size="sm">
          <Icon className="h-4 w-4 mr-2" />
          {config.buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>
            {config.description} para <span className="font-medium">{itemName}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {type !== 'adjust' && (
            <div className="text-sm text-muted-foreground">
              Estoque atual: <span className="font-medium text-foreground">{currentQty}</span>
            </div>
          )}

          {type === 'adjust' && (
            <div className="text-sm text-muted-foreground">
              Mínimo atual: <span className="font-medium text-foreground">{currentMinQty}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="qty">
              {type === 'adjust' ? 'Novo mínimo' : 'Quantidade'} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="qty"
              type="number"
              min="1"
              max={type === 'out' ? currentQty : undefined}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder={type === 'adjust' ? 'Ex: 5' : 'Ex: 10'}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          {type !== 'adjust' && (
            <div className="space-y-2">
              <Label htmlFor="note">Observação</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex: Compra de fornecedor, Usado em OS #123..."
                rows={2}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
