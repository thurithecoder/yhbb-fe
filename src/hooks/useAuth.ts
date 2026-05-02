import { useAppStore } from '@/app/store';

export const useAuth = () => {
  const { user, token, isHydrated, setUser, setToken, setSession, clearSession } = useAppStore();
  return { user, token, isHydrated, setUser, setToken, setSession, clearSession };
};
