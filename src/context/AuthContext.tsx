

"use client";

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import type { UserProfile, Role } from '@/types';
import { School } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({ user: null, userProfile: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!auth || !db) {
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      
      if (user) {
        // User is logged in, fetch their profile from Firestore.
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data() as Omit<UserProfile, 'id' | 'role'> & { status?: 'active' | 'inactive' };

            if (userData.status === 'inactive') {
                // If user is inactive, log them out and block access.
                setUser(null);
                setUserProfile(null);
                await signOut(auth);
                toast({
                    title: "Conta Desativada",
                    description: "Sua conta foi desativada. Entre em contato com um administrador.",
                    variant: "destructive"
                });
                 router.push('/login');
            } else {
                setUser(user);
                if (userData.roleId) {
                    const roleRef = doc(db, 'roles', userData.roleId);
                    const roleSnap = await getDoc(roleRef);
                    
                    if (roleSnap.exists()) {
                        const userRole = { id: roleSnap.id, ...roleSnap.data() } as Role;
                        setUserProfile({ id: user.uid, ...userData, role: userRole });
                    } else {
                        // User has a roleId that doesn't exist in the roles collection
                        setUserProfile({ id: user.uid, ...userData, role: null });
                    }
                } else {
                    // User has no roleId assigned
                    setUserProfile({ id: user.uid, ...userData, role: null });
                }
            }
        } else {
            // User exists in Auth but not in 'users' collection.
            // This could be a partially created user. Treat as having no profile.
            // Also handles the initial admin login case before the profile is created.
            setUser(user);
            setUserProfile({
              id: user.uid,
              email: user.email!,
              name: user.displayName || 'Usuário sem perfil',
              roleId: '',
              role: null,
              status: 'active'
            }); 
        }

      } else {
        // User is logged out.
        setUser(null);
        setUserProfile(null);
        if (pathname.startsWith('/admin')) {
            router.push('/login');
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="space-y-4 text-center">
            <School className="h-12 w-12 mx-auto text-primary animate-pulse" />
            <p className="text-muted-foreground">Carregando aplicação...</p>
        </div>
      </div>
    );
  }
  
  if (!db) {
    return (
       <div className="flex items-center justify-center h-screen bg-background">
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
    <AuthContext.Provider value={{ user, userProfile, loading }}>
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

    