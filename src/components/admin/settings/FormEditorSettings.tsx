
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, GripVertical } from "lucide-react";
import { produce } from "immer";

// This is a visual mock-up with state management.
// It does not yet persist data or dynamically build the real census form.

interface FormField {
    id: string;
    name: string;
    type: 'text' | 'number' | 'boolean' | 'date' | 'select' | 'file' | 'rating';
    required: boolean;
}

interface FormSection {
    id: string;
    name: string;
    fields: FormField[];
}

export function FormEditorSettings() {
    const [sections, setSections] = useState<FormSection[]>([
        { id: 'general', name: 'Dados Gerais', fields: [{ id: 'f1', name: 'Nome do Diretor', type: 'text', required: true }] },
        { id: 'infra', name: 'Infraestrutura', fields: [{ id: 'f2', name: 'Número de Salas', type: 'number', required: true }] },
        { id: 'tech', name: 'Tecnologia', fields: [{ id: 'f3', name: 'Possui Internet?', type: 'boolean', required: false }] },
    ]);

    const addField = (sectionIndex: number) => {
        setSections(produce(draft => {
            draft[sectionIndex].fields.push({
                id: `f${Date.now()}`,
                name: 'Novo Campo',
                type: 'text',
                required: false,
            });
        }));
    };

    const removeField = (sectionIndex: number, fieldIndex: number) => {
        setSections(produce(draft => {
            draft[sectionIndex].fields.splice(fieldIndex, 1);
        }));
    };
    
    const updateField = (sectionIndex: number, fieldIndex: number, key: keyof FormField, value: any) => {
        setSections(produce(draft => {
            (draft[sectionIndex].fields[fieldIndex] as any)[key] = value;
        }));
    };

    // A real implementation would save `sections` to a database or localStorage.

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Editor de Formulário do Censo</CardTitle>
                        <CardDescription>
                            Adicione, edite e remova seções e campos do formulário do censo.
                        </CardDescription>
                    </div>
                    <Button disabled>
                        <PlusCircle className="mr-2" /> Nova Seção
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {sections.map((section, sectionIndex) => (
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
                            {section.fields.map((field, fieldIndex) => (
                                <div key={field.id} className="flex items-end gap-2 border-l-2 pl-4">
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor={`field-name-${field.id}`}>Nome do Campo</Label>
                                        <Input 
                                            id={`field-name-${field.id}`} 
                                            value={field.name}
                                            onChange={(e) => updateField(sectionIndex, fieldIndex, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`field-type-${field.id}`}>Tipo de Campo</Label>
                                        <Select 
                                            value={field.type} 
                                            onValueChange={(value: FormField['type']) => updateField(sectionIndex, fieldIndex, 'type', value)}
                                        >
                                            <SelectTrigger id={`field-type-${field.id}`} className="w-[180px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="text">Texto</SelectItem>
                                                <SelectItem value="number">Número</SelectItem>
                                                <SelectItem value="boolean">Sim/Não (Checkbox)</SelectItem>
                                                <SelectItem value="date">Data</SelectItem>
                                                <SelectItem value="select">Lista de Opções</SelectItem>
                                                <SelectItem value="file" disabled>Upload de Arquivo</SelectItem>
                                                <SelectItem value="rating" disabled>Avaliação (Rating)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col items-center space-y-2 ml-4">
                                        <Label>Obrigatório</Label>
                                        <Switch 
                                            checked={field.required} 
                                            onCheckedChange={(checked) => updateField(sectionIndex, fieldIndex, 'required', checked)}
                                        />
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeField(sectionIndex, fieldIndex)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" className="mt-2" onClick={() => addField(sectionIndex)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Campo
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
