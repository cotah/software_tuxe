import { create } from 'zustand'

type IntegrationsState = {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useIntegrationsStore = create<IntegrationsState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
