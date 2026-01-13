
"use client";

import { useFieldArray, Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Trash2, UserCircle } from "lucide-react";

interface ManagementSectionProps {
    control: Control<any>;
}

export const ManagementSection = ({ control }: ManagementSectionProps) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "management.members",
    });

    const addMember = () => {
        append({
            id: `member_${Date.now()}`,
            name: '',
            role: '',
            phone: '',
            email: ''
        });
    };

    const roles = [
        "Gestor(a)",
        "Diretor(a)",
        "Vice-Diretor(a)",
        "Secretário(a)",
        "Coordenador(a) Pedagógico",
        "Orientador(a) Educacional",
        "Supervisor(a)",
        "Psicólogo(a)",
        "Outro"
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserCircle className="h-6 w-6" />
                    Equipe Gestora
                </CardTitle>
                <CardDescription>Adicione os membros da equipe de gestão escolar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    {fields.map((item, index) => (
                        <Card key={item.id} className="relative bg-muted/20 hover:bg-muted/30 transition-colors">
                            <CardContent className="p-4 md:p-6">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start md:items-center">

                                    <div className="md:col-span-12 lg:col-span-3">
                                        <FormField
                                            control={control}
                                            name={`management.members.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem className="space-y-2 md:space-y-1">
                                                    <FormLabel className="md:hidden">Nome Completo</FormLabel>
                                                    <FormLabel className="hidden md:block text-xs text-muted-foreground">Nome Completo</FormLabel>
                                                    <FormControl><Input {...field} placeholder="Nome do profissional" className="bg-background" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="md:col-span-6 lg:col-span-3">
                                        <FormField
                                            control={control}
                                            name={`management.members.${index}.role`}
                                            render={({ field }) => (
                                                <FormItem className="space-y-2 md:space-y-1">
                                                    <FormLabel className="md:hidden">Cargo/Função</FormLabel>
                                                    <FormLabel className="hidden md:block text-xs text-muted-foreground">Cargo/Função</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-background">
                                                                <SelectValue placeholder="Selecione..." />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {roles.map(role => (
                                                                <SelectItem key={role} value={role}>{role}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="md:col-span-6 lg:col-span-3">
                                        <FormField
                                            control={control}
                                            name={`management.members.${index}.phone`}
                                            render={({ field }) => (
                                                <FormItem className="space-y-2 md:space-y-1">
                                                    <FormLabel className="md:hidden">Telefone</FormLabel>
                                                    <FormLabel className="hidden md:block text-xs text-muted-foreground">Telefone</FormLabel>
                                                    <FormControl><Input {...field} placeholder="(00) 00000-0000" className="bg-background" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="md:col-span-11 lg:col-span-2">
                                        <FormField
                                            control={control}
                                            name={`management.members.${index}.email`}
                                            render={({ field }) => (
                                                <FormItem className="space-y-2 md:space-y-1">
                                                    <FormLabel className="md:hidden">E-mail</FormLabel>
                                                    <FormLabel className="hidden md:block text-xs text-muted-foreground">E-mail</FormLabel>
                                                    <FormControl><Input {...field} placeholder="email@escola.com" className="bg-background" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="md:col-span-1 flex justify-end md:justify-center pt-1 md:pt-6">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                            onClick={() => remove(index)}
                                            title="Remover membro"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>

                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {fields.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                            <p>Nenhum membro adicionado.</p>
                            <p className="text-sm">Clique abaixo para adicionar a equipe gestora.</p>
                        </div>
                    )}

                    <Button
                        type="button"
                        variant="outline"
                        onClick={addMember}
                        className="w-full border-dashed"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Novo Membro
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
