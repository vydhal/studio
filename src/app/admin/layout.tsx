
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Loader2 } from "lucide-react";
import {
  SidebarProvider,
  SidebarInset
} from "@/components/ui/sidebar";

// A chave de API de exemplo indica que estamos em um ambiente de teste sem um Firebase real.
const isTestMode = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.includes("AIzaSyXXX");

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(isTestMode); // Inicia como true se for modo de teste

  useEffect(() => {
    // Se não estiver em modo de teste, aplica a lógica de autenticação real.
    if (!isTestMode && !loading) {
      if (!user) {
        // Se não há usuário e não está carregando, redireciona para o login.
        router.push("/login");
      } else {
        // Se há um usuário, permite o acesso.
        setIsAllowed(true);
      }
    }
  }, [user, loading, router]);
  
  if (!isAllowed) {
    // Mostra um spinner enquanto verifica a autenticação ou se o acesso não for permitido.
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
