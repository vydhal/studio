
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Loader2 } from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset
} from "@/components/ui/sidebar";

const isTestMode = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.includes("AIzaSyXXX");

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    // Se estiver em modo de teste (sem Firebase real), permite o acesso direto.
    if (isTestMode) {
      setIsAllowed(true);
      return;
    }

    // Lógica original para ambiente com Firebase real
    if (!loading) {
      if (user) {
        setIsAllowed(true);
      } else {
        router.push("/login");
      }
    }
  }, [user, loading, router]);
  
  if (!isAllowed) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <div className="p-4 sm:p-6 lg:p-8">
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
