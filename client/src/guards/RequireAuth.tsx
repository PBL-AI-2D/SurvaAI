'use client';

import { unauthorized, forbidden } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface RequireAuthProps {
  children: ReactNode;
  roles?: string[];
}

export function RequireAuth({ children, roles }: RequireAuthProps) {
  const { user, loading, isLoggedIn, hydrated, isLoggingOut } = useAuth();
  const [statusChecked, setStatusChecked] = useState(false);

useEffect(() => {
  if (!hydrated || loading || isLoggingOut) return;

  if (!isLoggedIn) {
    if (!isLoggingOut) {
      unauthorized();
    }
    return;
  }

  if (roles && user && !roles.includes(user.role)) {
    forbidden();
    return;
  }

  setStatusChecked(true);
}, [hydrated, loading, isLoggedIn, roles, user, isLoggingOut]);


  // Jangan render konten dulu
  if (!hydrated || loading || isLoggingOut || !statusChecked) {
    return null;
  }

  return <>{children}</>;
}
