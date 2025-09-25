'use client';

import { usePathname } from 'next/navigation';
import { forbidden } from 'next/navigation';
import Navbar from '@/components/umum/navbar';
import Footer from '@/components/umum/footer';
import { Toaster } from 'sonner';
import { RequireAuth } from '@/guards/RequireAuth';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useEffect, useState } from 'react';

const PUBLIC_ROUTES = ['/', '/explore'];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, hydrated, loading } = useAuth();
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  const [isForbidden, setIsForbidden] = useState(false);

  useEffect(() => {
    if (!hydrated || loading) return;

    if (isPublic && user && user.role !== 'umum') {
      setIsForbidden(true);
    }
  }, [hydrated, loading, isPublic, user]);

  if (!hydrated || loading) {
    return null;
  }

  if (isForbidden) {
    forbidden();
  }

  const content = (
    <>
      <Navbar />
      <Toaster />
      {children}
      <Footer />
    </>
  );

  if (isPublic) return content;

  return (
    <RequireAuth roles={['umum']}>
      {content}
    </RequireAuth>
  );
}
