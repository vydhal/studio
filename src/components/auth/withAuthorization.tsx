
"use client";

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';
import type { FormSectionPermission } from '@/types';
import { useToast } from '@/hooks/use-toast';

const withAuthorization = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermission: FormSectionPermission
) => {
  const WithAuthorization: React.FC<P> = (props) => {
    const { userProfile, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    const hasPermission = userProfile?.role?.permissions.includes(requiredPermission);

    if (!hasPermission) {
      // Redirect them to the dashboard if they don't have permission.
      // We use useEffect to avoid server-side rendering issues with router.push
      React.useEffect(() => {
        toast({
            title: "Acesso Negado",
            description: "Você não tem permissão para acessar esta página.",
            variant: "destructive"
        });
        router.replace('/admin/dashboard');
      }, [router, toast]);

      // Render a fallback while redirecting
      return (
         <div className="flex flex-col justify-center items-center h-64 gap-4 text-destructive">
          <ShieldAlert className="h-12 w-12" />
          <h2 className="text-xl font-semibold">Acesso Negado</h2>
          <p className="text-muted-foreground">Você será redirecionado...</p>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  WithAuthorization.displayName = `WithAuthorization(${getDisplayName(WrappedComponent)})`;

  return WithAuthorization;
};

function getDisplayName<P>(WrappedComponent: React.ComponentType<P>) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default withAuthorization;
