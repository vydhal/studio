
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, GripVertical } from "lucide-react";
import { produce } from "immer";
import { useToast } from "@/hooks/use-toast";
import type { FormSectionConfig, FormFieldConfig } from "@/types";
import { Loader2 } from "lucide-react";


const FORM_CONFIG_STORAGE_KEY = 'censusFormConfig';

const defaultSections: FormSectionConfig[] = [
    { 
        id: 'general', 
        name: 'Dados Gerais e Modalidades',
        description: 'Selecione as modalidades de ensino oferecidas.',
        fields: [
            { id: 'f_mod_1', name: 'Anos Iniciais', type: 'boolean', required: true, sectionId: 'general' },
            { id: 'f_mod_2', name: 'Anos Finais', type: 'boolean', required: true, sectionId: 'general' },
            { id: 'f_mod_3', name: 'EJA', type: 'boolean', required: true, sectionId: 'general' },
        ] 
    },
    { 
        id: 'infra', 
        name: 'Infraestrutura',
        description: 'Adicione as salas de aula e seus detalhes.',
        fields: [
            { id: 'f_infra_1', name: 'Nome da Sala', type: 'text', required: true, sectionId: 'infra' },
            { id: 'f_infra_2', name: 'Nº de Cadeiras', type: 'number', required: false, sectionId: 'infra' },
        ] 
    },
    { 
        id: 'tech', 
        name: 'Tecnologia',
        description: 'Detalhes sobre os recursos tecnológicos da escola.',
        fields: [
            { id: 'f_tech_1', name: 'Possui Internet?', type: 'boolean', required: false, sectionId: 'tech' },
            { id: 'f_tech_2', name: 'Velocidade (Mbps)', type: 'number', required: false, sectionId: 'tech' }
        ] 
    },
];

export function FormEditorSettings() {
    const { toast } = useToast();
    const [sections, setSections] = useState<FormSectionConfig[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedConfig = localStorage.getItem(FORM_CONFIG_STORAGE_KEY);
            if (storedConfig) {
                setSections(JSON.parse(storedConfig));
            } else {
                setSections(defaultSections);
            }
        } catch (error) {
            console.error("Failed to parse form config from localStorage", error);
            setSections(defaultSections);
        }
        setLoading(false);
    }, []);

    const saveConfig = () => {
        try {
            localStorage.setItem(FORM_CONFIG_STORAGE_KEY, JSON.stringify(sections));
            toast({
                title: "Sucesso!",
                description: "Configurações do formulário salvas com sucesso.",
            });
        } catch (error) {
            toast({
                title: "Erro!",
                description: "Não foi possível salvar as configurações do formulário.",
                variant: "destructive",
            });
        }
    };

    const addField = (sectionIndex: number) => {
        setSections(produce(draft => {
            const sectionId = draft[sectionIndex].id;
            draft[sectionIndex].fields.push({
                id: `f_${Date.now()}`,
                name: 'Novo Campo',
                type: 'text',
                required: false,
                sectionId: sectionId
            });
        }));
    };

    const removeField = (sectionIndex: number, fieldIndex: number) => {
        setSections(produce(draft => {
            draft[sectionIndex].fields.splice(fieldIndex, 1);
        }));
    };
    
    const updateField = (sectionIndex: number, fieldIndex: number, key: keyof FormFieldConfig, value: any) => {
        setSections(produce(draft => {
            (draft[sectionIndex].fields[fieldIndex] as any)[key] = value;
        }));
    };

    if (loading) {
        return <p>Carregando editor...</p>;
    }

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
                     <Button onClick={saveConfig} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Formulário
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
                                            onValueChange={(value: FormFieldConfig['type']) => updateField(sectionIndex, fieldIndex, 'type', value)}
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
                 <Button variant="outline" disabled>
                    <PlusCircle className="mr-2 h-4 w-4" /> Nova Seção
                </Button>
            </CardContent>
        </Card>
    );
}
