
"use client";

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // If Firebase isn't configured, stop loading and show the app in a 'disconnected' state.
    if (!auth || !db) {
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      const isAdminRoute = pathname.startsWith('/admin');
      if (!user && isAdminRoute) {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="space-y-4 text-center">
            <School className="h-12 w-12 mx-auto text-primary animate-pulse" />
            <p className="text-muted-foreground">Carregando aplicação...</p>
        </div>
      </div>
    );
  }
  
  if (!db) {
    return (
       <div className="flex items-center justify-center h-screen">
        <div className="max-w-md p-8 text-center bg-card rounded-lg shadow-lg border border-destructive/50">
            <h1 className="text-2xl font-bold text-destructive mb-4">Erro de Configuração</h1>
            <p className="text-muted-foreground">
                A conexão com o banco de dados falhou. Verifique se as credenciais do Firebase foram configuradas corretamente no seu ambiente.
            </p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Add School icon for loading screen
import { School } from 'lucide-react';
