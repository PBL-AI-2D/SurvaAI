'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { LoginForm } from '@/features/auth/components/login-form';
import { toast } from 'sonner';

export function LoginPage() {
  const { loading, error, login, setError } = useAuth();

  if (error) {
    toast.error(error);
    setError(null);
  }

  return (
    <main className="flex items-center justify-center min-h-screen w-full md:px-10 px-5 py-16 text-foreground ">
      <section
        className="w-full max-w-[450px] border border-glass-border bg-glass-bg backdrop-blur-xl shadow-xl transition 
        px-6 py-10 space-y-6 rounded-none rounded-bl-[70px] rounded-tr-[70px]"
        style={{
          background: 'var(--glass-background)',
          borderColor: 'var(--glass-border)',
          boxShadow: 'var(--glass-shadow)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        <LoginForm onSubmit={login} loading={loading} />
      </section>
    </main>
  );
}
