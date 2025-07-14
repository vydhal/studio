import { LoginForm } from "@/components/auth/LoginForm";
import { School } from "lucide-react";
import Link from 'next/link'

export default function LoginPage() {
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
