
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, GripVertical } from "lucide-react";

// This is a visual mock-up and not a fully functional form builder.
// The state management is local and doesn't persist.

export function FormEditorSettings() {

  const sections = [
    { id: 'general', name: 'Dados Gerais', fields: [{ id: 'f1', name: 'Nome do Diretor', type: 'text' }] },
    { id: 'infra', name: 'Infraestrutura', fields: [{ id: 'f2', name: 'Número de Salas', type: 'number' }] },
    { id: 'tech', name: 'Tecnologia', fields: [{ id: 'f3', name: 'Possui Internet?', type: 'boolean' }] },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                 <CardTitle>Editor de Formulário do Censo</CardTitle>
                <CardDescription>
                Visualize e gerencie as seções e campos do formulário do censo.
                <br />
                <span className="text-destructive/80 font-semibold text-xs">(Funcionalidade em desenvolvimento)</span>
                </CardDescription>
            </div>
            <Button disabled>
                <PlusCircle className="mr-2" /> Nova Seção
            </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.map(section => (
          <div key={section.id} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                <h3 className="text-lg font-semibold">{section.name}</h3>
              </div>
              <Button variant="ghost" size="icon" disabled>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="space-y-4 pl-4">
              {section.fields.map(field => (
                <div key={field.id} className="flex items-end gap-2 border-l-2 pl-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`field-name-${field.id}`}>Nome do Campo</Label>
                    <Input id={`field-name-${field.id}`} value={field.name} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`field-type-${field.id}`}>Tipo de Campo</Label>
                     <Select defaultValue={field.type} disabled>
                        <SelectTrigger id={`field-type-${field.id}`} className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="text">Texto</SelectItem>
                            <SelectItem value="number">Número</SelectItem>
                            <SelectItem value="boolean">Sim/Não</SelectItem>
                            <SelectItem value="date">Data</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col items-center space-y-2 ml-4">
                    <Label>Obrigatório</Label>
                    <Switch disabled />
                  </div>
                   <Button variant="ghost" size="icon" disabled>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
              ))}
               <Button variant="outline" size="sm" className="mt-2" disabled>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Campo
                </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
