'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventory } from '@/lib/api'
import { InventoryItem, StockMovement, StockMovementType } from '@/types'

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventory.list(),
  })
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: ['inventory', id],
    queryFn: () => inventory.getById(id),
    enabled: !!id,
  })
}

export function useStockMovements(itemId: string) {
  return useQuery({
    queryKey: ['inventory', itemId, 'movements'],
    queryFn: () => inventory.movements.list(itemId),
    enabled: !!itemId,
  })
}

export function useCreateStockMovement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: {
      itemId: string
      type: StockMovementType
      qty: number
      note?: string
    }) => inventory.movements.create(payload),

    onMutate: async (payload) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['inventory', payload.itemId] })
      await queryClient.cancelQueries({ queryKey: ['inventory', payload.itemId, 'movements'] })
      await queryClient.cancelQueries({ queryKey: ['inventory'] })

      // Snapshot the previous values
      const previousItem = queryClient.getQueryData<InventoryItem>(['inventory', payload.itemId])
      const previousMovements = queryClient.getQueryData<StockMovement[]>(['inventory', payload.itemId, 'movements'])
      const previousList = queryClient.getQueryData<InventoryItem[]>(['inventory'])

      // Optimistically update the item
      if (previousItem) {
        let newQty = previousItem.qty
        if (payload.type === 'in') {
          newQty += payload.qty
        } else if (payload.type === 'out') {
          newQty = Math.max(0, newQty - payload.qty)
        } else if (payload.type === 'adjust') {
          newQty = Math.max(0, newQty + payload.qty)
        }

        queryClient.setQueryData<InventoryItem>(['inventory', payload.itemId], {
          ...previousItem,
          qty: newQty,
          updatedAt: new Date().toISOString(),
        })
      }

      // Optimistically update the list
      if (previousList) {
        queryClient.setQueryData<InventoryItem[]>(['inventory'], previousList.map((item) => {
          if (item.id === payload.itemId) {
            let newQty = item.qty
            if (payload.type === 'in') {
              newQty += payload.qty
            } else if (payload.type === 'out') {
              newQty = Math.max(0, newQty - payload.qty)
            } else if (payload.type === 'adjust') {
              newQty = Math.max(0, newQty + payload.qty)
            }
            return { ...item, qty: newQty, updatedAt: new Date().toISOString() }
          }
          return item
        }))
      }

      // Optimistically add the movement
      const optimisticMovement: StockMovement = {
        id: `temp-${Date.now()}`,
        itemId: payload.itemId,
        type: payload.type,
        qty: payload.qty,
        note: payload.note,
        createdAt: new Date().toISOString(),
        createdBy: 'Carlos',
      }

      if (previousMovements) {
        queryClient.setQueryData<StockMovement[]>(
          ['inventory', payload.itemId, 'movements'],
          [optimisticMovement, ...previousMovements]
        )
      }

      return { previousItem, previousMovements, previousList }
    },

    onError: (_error, payload, context) => {
      // Rollback on error
      if (context?.previousItem) {
        queryClient.setQueryData(['inventory', payload.itemId], context.previousItem)
      }
      if (context?.previousMovements) {
        queryClient.setQueryData(['inventory', payload.itemId, 'movements'], context.previousMovements)
      }
      if (context?.previousList) {
        queryClient.setQueryData(['inventory'], context.previousList)
      }
    },

    onSettled: (_data, _error, payload) => {
      // Refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['inventory', payload.itemId] })
      queryClient.invalidateQueries({ queryKey: ['inventory', payload.itemId, 'movements'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })
}

export function useUpdateMinQty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, minQty }: { id: string; minQty: number }) =>
      inventory.updateMinQty(id, minQty),

    onMutate: async ({ id, minQty }) => {
      await queryClient.cancelQueries({ queryKey: ['inventory', id] })
      await queryClient.cancelQueries({ queryKey: ['inventory'] })

      const previousItem = queryClient.getQueryData<InventoryItem>(['inventory', id])
      const previousList = queryClient.getQueryData<InventoryItem[]>(['inventory'])

      if (previousItem) {
        queryClient.setQueryData<InventoryItem>(['inventory', id], {
          ...previousItem,
          minQty,
          updatedAt: new Date().toISOString(),
        })
      }

      if (previousList) {
        queryClient.setQueryData<InventoryItem[]>(['inventory'], previousList.map((item) => {
          if (item.id === id) {
            return { ...item, minQty, updatedAt: new Date().toISOString() }
          }
          return item
        }))
      }

      return { previousItem, previousList }
    },

    onError: (_error, { id }, context) => {
      if (context?.previousItem) {
        queryClient.setQueryData(['inventory', id], context.previousItem)
      }
      if (context?.previousList) {
        queryClient.setQueryData(['inventory'], context.previousList)
      }
    },

    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['inventory', id] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })
}
