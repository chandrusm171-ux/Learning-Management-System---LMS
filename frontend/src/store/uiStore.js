import { create } from 'zustand';

export const useUIStore = create((set) => ({
  isDark: false,
  sidebarOpen: true,
  toggleDark: () => set((state) => {
    const isDark = !state.isDark;
    document.documentElement.classList.toggle('dark', isDark);
    return { isDark };
  }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
