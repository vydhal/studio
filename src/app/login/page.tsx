
"use client"
import { LoginForm } from "@/components/auth/LoginForm";
import { School } from "lucide-react";
import Link from 'next/link'
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (userProfile?.role?.name === 'Unidade Educacional') {
        router.push('/census');
      } else {
        router.push('/admin/dashboard');
      }
    }
  }, [user, userProfile, loading, router]);


  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="text-center">
            <Link href="/" className="inline-block">
                <School className="h-12 w-12 mx-auto text-primary" />
            </Link>
          <h1 className="mt-6 text-3xl font-bold tracking-tight font-headline">
            Admin Login
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Acesse o painel de gerenciamento
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
