
"use client";

import { UserManagementClient } from "@/components/admin/users/UserManagementClient";
import withAuthorization from "@/components/auth/withAuthorization";

function UsersPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Usuários e Perfis</h1>
        <p className="text-muted-foreground">
          Gerencie os usuários do sistema e seus respectivos perfis de acesso.
        </p>
      </div>
      <UserManagementClient />
    </div>
  );
}

// Protect this page, only allowing users with the 'users' permission
export default withAuthorization(UsersPage, 'users');
