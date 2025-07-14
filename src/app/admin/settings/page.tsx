
"use client";

import { SettingsTabs } from "@/components/admin/settings/SettingsTabs";
import withAuthorization from "@/components/auth/withAuthorization";

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema, formulários e escolas.
        </p>
      </div>
      <SettingsTabs />
    </div>
  );
}

// Protect this page, only allowing users with the 'users' permission
export default withAuthorization(SettingsPage, 'users');
