import { UserManagementClient } from "@/components/admin/users/UserManagementClient";
import type { UserProfile, Role } from "@/types";

// Mock data for users and roles
const getMockRoles = (): Role[] => [
  { id: 'role1', name: 'Admin', permissions: ['general', 'infrastructure', 'technology', 'cultural', 'maintenance', 'users'] },
  { id: 'role2', name: 'Equipe de TI', permissions: ['technology'] },
  { id: 'role3', name: 'Equipe de Infraestrutura', permissions: ['infrastructure', 'maintenance'] },
];

const getMockUsers = (): UserProfile[] => [
  { id: 'user1', name: 'Admin Geral', email: 'admin@escola.com', roleId: 'role1' },
  { id: 'user2', name: 'Técnico de TI', email: 'ti@escola.com', roleId: 'role2' },
  { id: 'user3', name: 'Coordenador de Infra', email: 'infra@escola.com', roleId: 'role3' },
];

export default async function UsersPage() {
  const users = getMockUsers();
  const roles = getMockRoles();

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Usuários e Perfis</h1>
        <p className="text-muted-foreground">
          Gerencie os usuários do sistema e seus respectivos perfis de acesso.
        </p>
      </div>
      <UserManagementClient initialUsers={users} initialRoles={roles} />
    </div>
  );
}
