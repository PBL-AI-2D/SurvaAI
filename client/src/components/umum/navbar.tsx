"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "next-themes";
import { User, LogOut, IdCard } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isLoggedIn, user, logout, hydrated } = useAuth();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const logoSrc = resolvedTheme === "dark"
    ? "/images/surva-white.png"
    : "/images/surva.png";

  if (!mounted || !hydrated) {
    return (
      <nav className="fixed top-0 left-0 w-full h-16 z-50 backdrop-blur-md border-b border-[var(--glass-border)] bg-[var(--glass-bg)] shadow">
        <div className="w-full h-full px-6 md:px-12 flex items-center justify-between" >
          <Link href="/" className="hover:opacity-80 transition-opacity flex items-center">
            <Image
              src={logoSrc}
              alt="Surva Logo"
              width={0}
              height={0}
              sizes="50vw"
              className="object-contain h-auto w-[120px]"
              priority
            />
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 w-screen h-16 z-50 backdrop-blur-md border-b border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-md transition-colors duration-300">
      <div className="w-full h-full px-6 md:px-12 flex items-center justify-between">
        <Link href="/" className="hover:opacity-80 transition-opacity flex items-center">
          <Image
            src={logoSrc}
            alt="Surva Logo"
            width={0}
            height={0}
            sizes="50vw"
            className="object-contain h-auto w-[120px]"
            priority
          />
        </Link>

        <div className="flex gap-4 items-center">
          <ThemeToggle />

          {isLoggedIn ? (
            <div ref={dropdownRef} className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDropdown}
                aria-label="Toggle user menu"
                className="cursor-pointer rounded-full bg-glass-background border border-glass-border backdrop-blur-md transition-all hover:shadow-lg"
              >
                <User className="w-6 h-6" />
              </Button>

              {isOpen && (
                <div className="absolute right-0 top-12 mt-2 w-60 bg-[var(--glass-bg)] text-foreground rounded-xl shadow-lg z-20 p-4 border border-[var(--glass-border)] backdrop-blur-md transition-colors duration-200">
                  <div className="mb-3 space-y-0.5">
                    <p className="font-semibold text-md truncate">
                      {user?.Umum?.nama || "Anonymous"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                  <ul className="py-3 border-y border-border space-y-1">
                    <li>
                      <Link
                        href="/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 px-2 py-2 rounded-md text-sm hover:bg-white/30 dark:hover:bg-white/10 transition"
                      >
                        <IdCard className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                    </li>
                  </ul>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-full flex items-center justify-start mt-3 gap-2 px-2 py-2 text-sm hover:bg-white/30 dark:hover:bg-white/10 hover:text-foreground transition"
                    onClick={logout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button 
                className="backdrop-blur-md border border-glass-border text-foreground
                  shadow-md hover:shadow-lg hover:opacity-80"
                style={{
                  background: 'var(--glass-background)',
                  backdropFilter: 'var(--glass-blur)',
                }}
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
