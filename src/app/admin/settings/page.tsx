import { SettingsTabs } from "@/components/admin/settings/SettingsTabs";

export default function SettingsPage() {
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
