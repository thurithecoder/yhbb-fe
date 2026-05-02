import * as React from 'react';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useAuth } from '@/hooks/useAuth';
import { isTokenExpired } from '@/lib/auth';

interface ProvidersProps {
  children: React.ReactNode;
}

function SessionBootstrap() {
  const { token, isHydrated, clearSession } = useAuth();

  React.useEffect(() => {
    if (isHydrated && token && isTokenExpired(token)) {
      clearSession();
    }
  }, [clearSession, isHydrated, token]);

  return null;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <SessionBootstrap />
      {children}
      <Toaster position="top-center" richColors />
    </ErrorBoundary>
  );
}
