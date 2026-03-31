import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      isAdmin: () => get().user?.role === 'admin',
      isInstructor: () => get().user?.role === 'instructor',
      isStudent: () => get().user?.role === 'student',
    }),
    { name: 'lms-auth', partialize: (state) => ({ user: state.user, token: state.token }) }
  )
);
