
"use client";

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import type { UserProfile, Role } from '@/types';
import { School } from 'lucide-react';


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

  useEffect(() => {
    if (!auth || !db) {
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setUser(user);

      if (user) {
        // User is logged in, fetch their profile from Firestore.
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data() as Omit<UserProfile, 'id' | 'role'>;
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
            // User exists in Auth but not in 'users' collection.
            setUserProfile(null); 
        }

      } else {
        // User is logged out.
        setUserProfile(null);
        if (pathname.startsWith('/admin')) {
            router.push('/login');
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

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
