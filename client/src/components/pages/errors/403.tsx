'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

export function ForbiddenPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc =
    resolvedTheme === 'dark'
      ? '/images/surva-white.png'
      : '/images/surva.png';

  return (
    <>
      {/* Background Gradient */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none w-full"
        aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 30%, var(--color-primary-1), var(--background))`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      />

      {/* Navbar */}
      <nav className="absolute top-0 z-50 w-full h-16 px-5 md:px-12 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="hover:opacity-80 transition-opacity flex items-center"
        >
          {mounted && (
            <Image
              src={logoSrc}
              alt="Surva Logo"
              width={0}
              height={0}
              sizes="50vw"
              className="h-auto w-[120px] object-contain"
              priority
            />
          )}
        </Link>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-screen px-4">
        <div
          className="w-full max-w-md px-6 py-10 rounded-2xl text-center border backdrop-blur-md
            bg-muted-background text-foreground border-glass-border shadow-xl"
          style={{
            background: 'var(--glass-background)',
            borderColor: 'var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
            backdropFilter: 'var(--glass-blur)',
          }}
        >
          <h1 className="text-5xl font-extrabold text-destructive mb-4">Error - 403</h1>
          <p className="text-sm md:text-base text-muted-foreground mb-8">
            Access denied. You do not have permission to view this page.
          </p>
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="w-full md:w-auto px-6 py-2 border border-glass-border bg-muted-foreground
              text-background backdrop-blur-md hover:shadow-lg transition-shadow"
          >
            Go Back
          </Button>
        </div>
      </main>
    </>
  );
}
