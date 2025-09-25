"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Toaster } from "sonner";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc =
    resolvedTheme === "dark"
      ? "/images/surva-white.png"
      : "/images/surva.png";

  return (
    <>
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

      <Toaster />
      {children}
    </>
  );
}
