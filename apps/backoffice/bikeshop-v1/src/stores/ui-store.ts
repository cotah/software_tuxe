import { create } from 'zustand'

interface UIState {
  // Command Bar
  commandBarOpen: boolean
  openCommandBar: () => void
  closeCommandBar: () => void
  toggleCommandBar: () => void

  // Sidebar (for mobile)
  sidebarOpen: boolean
  openSidebar: () => void
  closeSidebar: () => void
  toggleSidebar: () => void

  // Selected items
  selectedCustomerId: string | null
  setSelectedCustomerId: (id: string | null) => void

  // Notifications panel
  notificationsPanelOpen: boolean
  toggleNotificationsPanel: () => void
  closeNotificationsPanel: () => void
}

export const useUIStore = create<UIState>((set) => ({
  // Command Bar
  commandBarOpen: false,
  openCommandBar: () => set({ commandBarOpen: true }),
  closeCommandBar: () => set({ commandBarOpen: false }),
  toggleCommandBar: () => set((state) => ({ commandBarOpen: !state.commandBarOpen })),

  // Sidebar
  sidebarOpen: false,
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Selected items
  selectedCustomerId: null,
  setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),

  // Notifications panel
  notificationsPanelOpen: false,
  toggleNotificationsPanel: () => set((state) => ({ notificationsPanelOpen: !state.notificationsPanelOpen })),
  closeNotificationsPanel: () => set({ notificationsPanelOpen: false }),
}))
