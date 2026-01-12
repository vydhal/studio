import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Package } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Controller } from 'react-hook-form';

interface InventoryCategoryProps {
    categoryKey: string;
    title: string;
    control: any;
    register: any;
    errors: any;
    isOpen?: boolean;
}

const InventoryCategoryList = ({ categoryKey, title, control, register, errors }: InventoryCategoryProps) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `inventory.${categoryKey}`
    });

    return (
        <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h4 className="text-sm font-medium leading-none">{title}</h4>
                    <p className="text-sm text-muted-foreground">
                        Total de itens: {fields.length}
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => append({ description: '', quantity: 0, origin: '', observation: '' })}
                >
                    <PlusCircle className="h-4 w-4" />
                    Adicionar Item
                </Button>
            </div>

            {fields.length === 0 && (
                <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground mb-2">Nenhum item adicionado nesta categoria.</p>
                    <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={() => append({ description: '', quantity: 0, origin: '', observation: '' })}
                    >
                        Adicionar o primeiro item
                    </Button>
                </div>
            )}

            <div className="grid gap-4">
                {fields.map((field, index) => (
                    <Card key={field.id} className="relative">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => remove(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <CardContent className="pt-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-12 items-start">
                            <div className="lg:col-span-4 space-y-2">
                                <Label>Descrição do Material</Label>
                                <Input
                                    {...register(`inventory.${categoryKey}.${index}.description`, { required: 'Descrição é obrigatória' })}
                                    placeholder="Ex: Projetor Epson, Jogo de Xadrez..."
                                />
                            </div>
                            <div className="lg:col-span-2 space-y-2">
                                <Label>Quantidade</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    {...register(`inventory.${categoryKey}.${index}.quantity`, { valueAsNumber: true })}
                                />
                            </div>
                            <div className="lg:col-span-3 space-y-2">
                                <Label>Origem</Label>
                                <Controller
                                    control={control}
                                    name={`inventory.${categoryKey}.${index}.origin`}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="prefeitura">Prefeitura/Secretaria</SelectItem>
                                                <SelectItem value="pdde">PDDE</SelectItem>
                                                <SelectItem value="proprio">Recurso Próprio</SelectItem>
                                                <SelectItem value="doacao">Doação</SelectItem>
                                                <SelectItem value="outro">Outro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            <div className="lg:col-span-3 space-y-2">
                                <Label>Observação</Label>
                                <Textarea
                                    className="min-h-[38px] h-[38px] resize-none focus:h-20 transition-all"
                                    {...register(`inventory.${categoryKey}.${index}.observation`)}
                                    placeholder="Estado de conservação, tombo..."
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export function InventorySection() {
    const { control, register, formState: { errors } } = useFormContext();

    const categories = [
        { key: 'permanent_tech', title: 'Material Permanente e Recursos Tecnológicos' },
        { key: 'audio_visual', title: 'Recursos Áudio Visuais' },
        { key: 'connected_edu', title: 'Recursos Educação Conectada' },
        { key: 'pedagogical_games', title: 'Recursos Pedagógicos e Jogos' },
        { key: 'pedagogical_aee', title: 'Recursos Pedagógicos da Sala do AEE' },
        { key: 'physical_edu', title: 'Material de Educação Física' },
        { key: 'office_supplies', title: 'Material de Expediente - Secretaria' },
        { key: 'hygiene_cleaning', title: 'Material de Higiene Pessoal e Limpeza' },
        { key: 'warehouse', title: 'Material Disponível no Almoxarifado' },
        { key: 'library', title: 'Biblioteca - Livros de Literatura/Diversos' },
    ];

    return (
        <Card>
            <CardHeader className="border-b bg-muted/40">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Package className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle>Inventário de Recursos e Materiais</CardTitle>
                        <CardDescription>
                            Registre a quantidade e detalhes dos materiais disponíveis na unidade.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                    {categories.map((cat) => (
                        <AccordionItem value={cat.key} key={cat.key} className="px-6 border-b">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex items-center gap-2 text-left">
                                    <span className="font-semibold">{cat.title}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-6">
                                <InventoryCategoryList
                                    categoryKey={cat.key}
                                    title={cat.title}
                                    control={control}
                                    register={register}
                                    errors={errors}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}
