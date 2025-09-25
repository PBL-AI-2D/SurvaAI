'use client';

import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { Toaster } from "sonner";
import { RequireAuth } from "@/guards/RequireAuth";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { hydrated, loading } = useAuth();

  if (!hydrated || loading) {
    return null;
  }

  return (
    <RequireAuth roles={['admin']}>
      <SidebarProvider>
        <AdminSidebar />
        <div className="flex-grow min-w-0">
          <AdminHeader />
          <Toaster />
          <main className="flex flex-grow bg-background/70 flex-col p-3 min-h-[calc(100%-64px)]">
            <div className="fixed inset-0 -z-10 pointer-events-none w-full" />
            {children}
          </main>
        </div>
      </SidebarProvider>
    </RequireAuth>
  );
}
