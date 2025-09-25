"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CircleUserRound, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";

export function AdminHeader() {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, user, logout, hydrated } = useAuth();

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!hydrated) {
    return (
      <header className="sticky top-0 w-full flex justify-between items-center text-foreground bg-background border border-t-0 border-x-0 border-glass-border py-1 h-16 px-3 z-10">
        <SidebarTrigger />
        <div className="flex items-center gap-2">
          <div className="relative" ref={dropdownRef}>
            <button className="cursor-pointer flex items-center justify-center text-foreground hover:text-background hover:bg-muted-foreground h-8 w-8 rounded-full transition">
              <CircleUserRound className="h-8 w-8" />
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 w-full flex justify-between items-center text-foreground bg-background border border-t-0 border-x-0 border-glass-border py-1 h-16 px-3 z-10">
      <SidebarTrigger />

      {isLoggedIn ? (
        <div className="flex items-center justify-center gap-4 relative" ref={dropdownRef}>
          <ThemeToggle />

          <button
            onClick={toggleDropdown}
            className="cursor-pointer flex items-center justify-center text-foreground hover:text-background hover:bg-muted-foreground h-8 w-8 rounded-full transition"
          >
            <CircleUserRound className="h-8 w-8" />
          </button>

          {isOpen && (
            <div className="absolute right-0 top-12 mt-2 w-60 bg-background text-foreground rounded-xl shadow-lg z-20 p-4 border border-[var(--glass-border)] backdrop-blur-md transition">
              <div className="mb-3 space-y-0.5">
                <p className="font-semibold text-md truncate">
                  {user?.Admin?.nama_admin || "Anonymous"}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {user?.email || "user@example.com"}
                </p>
              </div>

              <Separator className="bg-foreground/30" />

              <Button
                size="icon"
                className="w-full flex items-center justify-start mt-3 gap-2 px-2 py-2 text-sm bg-background text-foreground hover:bg-muted-foreground hover:text-background transition"
                onClick={logout}
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Link href="/login" passHref>
          <Button className="font-semibold text-lg bg-accent-1 text-primary-1 hover:bg-primary-3 hover:text-foreground">
            Sign in
          </Button>
        </Link>
      )}
    </header>
  );
}
