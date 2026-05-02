import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { User } from '@/types';

interface AppState {
  user: User | null;
  token: string | null;
  isHydrated: boolean;
  setSession: (payload: { user: User; token: string }) => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  clearSession: () => void;
  setHydrated: (value: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isHydrated: false,
      setSession: ({ user, token }) => set({ user, token }),
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      clearSession: () => set({ user: null, token: null }),
      setHydrated: (isHydrated) => set({ isHydrated }),
    }),
    {
      name: 'yalah-session',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
