import { create } from "zustand";

export const useUIStore = create((set) => ({
  // State
  isSidebarOpen: false,

  // Actions
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  openSidebar: () => set({ isSidebarOpen: true }),
}));