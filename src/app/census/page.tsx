
"use client";

import { SchoolCensusForm } from "@/components/census/SchoolCensusForm";
import { Header } from "@/components/shared/Header";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";


export default function CensusPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold tracking-tight font-headline">Formulário do Censo Escolar</h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Preencha as informações da sua escola abaixo.
              </p>
            </div>
            <SchoolCensusForm />
          </div>
        </div>
      </main>
    </div>
  );
}

  