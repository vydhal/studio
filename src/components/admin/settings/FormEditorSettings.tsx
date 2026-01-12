

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, GripVertical, Loader2, AlertTriangle } from "lucide-react";
import { produce } from "immer";
import { useToast } from "@/hooks/use-toast";
import type { FormSectionConfig, FormFieldConfig } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";


const FORM_CONFIG_DOC_ID = 'formConfig';

const defaultSections: FormSectionConfig[] = [
    { 
        id: 'general', 
        name: 'Dados Gerais e Modalidades',
        description: 'Informações gerais da unidade, gestão e modalidades de ensino.',
        fields: [
            { id: 'f_nucleo', name: 'Núcleo', type: 'select', required: false, sectionId: 'general', options: Array.from({length: 12}, (_, i) => String(i + 1)) },
            { id: 'f_endereco', name: 'Endereço', type: 'text', required: false, sectionId: 'general' },
            { id: 'f_bairro', name: 'Bairro', type: 'text', required: false, sectionId: 'general' },
            { id: 'f_cep', name: 'CEP', type: 'text', required: false, sectionId: 'general' },
            { id: 'f_telefone', name: 'Telefone (Fone)', type: 'text', required: false, sectionId: 'general' },
            { id: 'f_periodo_gestao', name: 'Período da Gestão', type: 'text', required: false, sectionId: 'general' },
            { id: 'f_gestor_nome', name: 'Nome do Gestor(a)', type: 'text', required: false, sectionId: 'general' },
            { id: 'f_secretaria_nome', name: 'Nome da Secretária da Escola', type: 'text', required: false, sectionId: 'general' },
            { id: 'f_equipe_gestor', name: 'Equipe: Gestor', type: 'text', required: false, sectionId: 'general' },
            { id: 'f_equipe_orientador', name: 'Equipe: Orientador', type: 'text', required: false, sectionId: 'general' },
            { id: 'f_equipe_supervisor', name: 'Equipe: Supervisor', type: 'text', required: false, sectionId: 'general' },
            { id: 'f_equipe_psicologa', name: 'Equipe: Psicóloga', type: 'text', required: false, sectionId: 'general' },
            { id: 'f_equipe_pedagogo', name: 'Equipe: Pedagogo', type: 'text', required: false, sectionId: 'general' },
            { id: 'f_mod_ei', name: 'Educação Infantil', type: 'boolean', required: false, sectionId: 'general' },
            { id: 'f_mod_1', name: 'Ensino Fundamental - Anos Iniciais', type: 'boolean', required: false, sectionId: 'general' },
            { id: 'f_mod_2', name: 'Ensino Fundamental - Anos Finais', type: 'boolean', required: false, sectionId: 'general' },
            { id: 'f_mod_3', name: 'Educação de Jovens e Adultos - EJA', type: 'boolean', required: false, sectionId: 'general' },
            { id: 'f_mod_ti', name: 'Ensino em Tempo Integral', type: 'boolean', required: false, sectionId: 'general' },
            { id: 'f_mod_ee', name: 'Educação Especial - AEE', type: 'boolean', required: false, sectionId: 'general' },
        ] 
    },
    { 
        id: 'infrastructure', 
        name: 'Infraestrutura',
        description: 'Adicione as salas de aula e seus detalhes. Esta seção é fixa e não pode ser removida.',
        fields: []
    },
    { 
        id: 'professionals', 
        name: 'Profissionais',
        description: 'Alocação de profissionais por turma. Esta seção é fixa e não pode ser removida.',
        fields: []
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
    {
        id: 'cultural',
        name: 'Cultural',
        description: 'Informações sobre atividades e espaços culturais.',
        fields: []
    },
    {
        id: 'maintenance',
        name: 'Manutenção',
        description: 'Detalhes sobre a manutenção e estado da escola.',
        fields: []
    }
];

export function FormEditorSettings() {
    const { toast } = useToast();
    const [sections, setSections] = useState<FormSectionConfig[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db) return;
        setLoading(true);
        const fetchConfig = async () => {
            const docRef = doc(db, 'settings', FORM_CONFIG_DOC_ID);
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSections(docSnap.data().sections || defaultSections);
                } else {
                    setSections(defaultSections);
                    // Optionally save default config to Firestore
                    await setDoc(docRef, { sections: defaultSections });
                }
            } catch (error) {
                console.error("Failed to fetch form config from Firestore", error);
                setSections(defaultSections);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const saveConfig = async () => {
        if (!db) {
             toast({ title: "Erro de Conexão", description: "Banco de dados não disponível.", variant: "destructive" });
             return;
        }
        setLoading(true);
        const docRef = doc(db, 'settings', FORM_CONFIG_DOC_ID);
        try {
            await setDoc(docRef, { sections });
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
        } finally {
            setLoading(false);
        }
    };

    const addSection = () => {
        setSections(produce(draft => {
            draft.push({
                id: `sec_${Date.now()}`,
                name: "Nova Seção",
                description: "Descrição da nova seção.",
                fields: []
            });
        }));
    };

    const removeSection = (sectionIndex: number) => {
        setSections(produce(draft => {
            draft.splice(sectionIndex, 1);
        }));
    };
    
    const updateSection = (sectionIndex: number, key: keyof FormSectionConfig, value: string) => {
         setSections(produce(draft => {
            (draft[sectionIndex] as any)[key] = value;
        }));
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
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Editor de Formulário do Censo</CardTitle>
                    <CardDescription>
                        Adicione, edite e remova seções e campos do formulário do censo.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center p-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Editor de Formulário do Censo</CardTitle>
                <CardDescription>
                    Adicione, edite e remova seções e campos do formulário do censo. Suas alterações serão salvas automaticamente.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {sections.map((section, sectionIndex) => (
                    <div key={section.id} className="p-4 border rounded-lg space-y-4 bg-muted/20">
                        <div className="flex justify-between items-center gap-4">
                            <div className="flex items-center gap-2 flex-grow">
                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                <div className="flex-grow space-y-1">
                                    <Label htmlFor={`section-name-${section.id}`}>Nome da Seção</Label>
                                    <Input 
                                        id={`section-name-${section.id}`}
                                        value={section.name}
                                        className="font-semibold text-lg"
                                        onChange={(e) => updateSection(sectionIndex, 'name', e.target.value)}
                                        disabled={['general', 'infrastructure', 'professionals'].includes(section.id)}
                                    />
                                </div>
                            </div>
                            {!['general', 'infrastructure', 'professionals'].includes(section.id) && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="flex items-center gap-2">
                                                <AlertTriangle className="text-destructive"/>
                                                Confirmar Exclusão
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Tem certeza de que deseja excluir a seção "<strong>{section.name}</strong>"? Todos os campos dentro dela serão perdidos. Esta ação não pode ser desfeita.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => removeSection(sectionIndex)} className="bg-destructive hover:bg-destructive/90">
                                                Excluir
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                        <div className="pl-6 space-y-2">
                            <Label htmlFor={`section-desc-${section.id}`}>Descrição da Seção</Label>
                             <Input 
                                id={`section-desc-${section.id}`}
                                value={section.description}
                                placeholder="Descrição da seção (opcional)"
                                onChange={(e) => updateSection(sectionIndex, 'description', e.target.value)}
                            />
                        </div>

                        { !['infrastructure', 'professionals'].includes(section.id) && (
                        <div className="space-y-4 pt-4 border-t mt-4">
                            <h4 className="font-medium pl-6">Campos da Seção</h4>
                             {section.fields.length === 0 && (
                                <p className="text-sm text-muted-foreground pl-6">Nenhum campo nesta seção ainda.</p>
                            )}
                            {section.fields.map((field, fieldIndex) => (
                                <div key={field.id} className="flex items-end gap-2 ml-6 border-l-2 pl-4 py-2 bg-background rounded-l-md">
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
                            <Button variant="outline" size="sm" className="mt-2 ml-6" onClick={() => addField(sectionIndex)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Campo
                            </Button>
                        </div>
                        )}
                    </div>
                ))}
                 <Button variant="outline" onClick={addSection}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Nova Seção
                </Button>
            </CardContent>
            <CardFooter>
                 <Button onClick={saveConfig} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Alterações
                </Button>
            </CardFooter>
        </Card>
    );
}

    