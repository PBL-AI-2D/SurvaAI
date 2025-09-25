'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import Link from 'next/link';
import { Newspaper , LayoutGrid, Coins } from 'lucide-react';

const navItems = [
  { href: '/explore', label: 'Explore Survey', icon: LayoutGrid },
  { href: '/manage-survey', label: 'Manage Survey', icon: Newspaper  },
  { href: '/exchange', label: 'Point Exchange', icon: Coins },
];

export function NavUmum() {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return null;

  return (
    <nav className="pt-6 w-full">
      <ul className="flex flex-wrap gap-4">
        {navItems.map(({ href, label, icon: Icon }) => (
          <li key={href} className="flex-1 md:max-w-[200px]">
            <Link
              href={href}
              className="flex items-center justify-center gap-2 px-4 py-3 w-full rounded-lg font-semibold text-foreground text-sm md:text-base
                backdrop-blur-xl border border-glass-border transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02]"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255, 200, 120, 0.25), transparent 80%),
                  radial-gradient(circle at bottom right, rgba(255, 160, 90, 0.15), transparent 70%)`
                ,
                backdropFilter: 'var(--glass-blur)',
                borderColor: 'var(--glass-border)',
              }}
            >
              <Icon className="w-4 h-4 text-foreground" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
