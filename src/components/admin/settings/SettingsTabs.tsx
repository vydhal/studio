
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HomePageSettingsForm } from "./SettingsForm";
import { SchoolSettingsForm } from "./SchoolSettingsForm";
import { FormEditorSettings } from "./FormEditorSettings";
import { ProfessionalsSettingsForm } from "./ProfessionalsSettingsForm";

export function SettingsTabs() {
  return (
    <Tabs defaultValue="schools" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="schools">Escolas</TabsTrigger>
        <TabsTrigger value="professionals">Profissionais</TabsTrigger>
        <TabsTrigger value="form-editor">Editor de Formulário</TabsTrigger>
        <TabsTrigger value="homepage">Página Inicial</TabsTrigger>
      </TabsList>
      <TabsContent value="schools">
        <SchoolSettingsForm />
      </TabsContent>
       <TabsContent value="professionals">
        <ProfessionalsSettingsForm />
      </TabsContent>
      <TabsContent value="form-editor">
        <FormEditorSettings />
      </TabsContent>
      <TabsContent value="homepage">
        <HomePageSettingsForm />
      </TabsContent>
    </Tabs>
  );
}
