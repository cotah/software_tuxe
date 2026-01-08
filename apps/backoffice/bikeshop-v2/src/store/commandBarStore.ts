import { create } from 'zustand'

interface CommandBarState {
  isOpen: boolean
  query: string
  open: () => void
  close: () => void
  toggle: () => void
  setQuery: (query: string) => void
  reset: () => void
}

export const useCommandBarStore = create<CommandBarState>((set) => ({
  isOpen: false,
  query: '',
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false, query: '' }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setQuery: (query) => set({ query }),
  reset: () => set({ isOpen: false, query: '' }),
}))
