import { SettingsForm } from "@/components/admin/settings/SettingsForm";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da página inicial e outras opções do sistema.
        </p>
      </div>
      <SettingsForm />
    </div>
  );
}
