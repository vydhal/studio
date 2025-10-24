

"use client";

import { useForm, useFieldArray, Controller, useWatch, useFormContext, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { School, FormSectionConfig, FormFieldConfig, SchoolCensusSubmission, Classroom, Professional, ClassroomAllocation, TeacherAllocation } from "@/types";
import { professionalContractTypes, professionalObservationTypes } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Loader2, Building, HardHat, Laptop, Palette, Wrench, PlusCircle, Trash2, UserCog, ChevronsUpDown, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { produce } from "immer";
import { useAppSettings } from "@/context/AppContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";


const classroomSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "O nome da sala é obrigatório."),
  studentCapacity: z.number().min(0).optional(),
  isAdapted: z.boolean().optional(),
  occupationType: z.enum(['turn', 'integral']).default('turn'),
  
  studentsMorning: z.number().min(0).optional(),
  gradeMorning: z.string().optional(),
  studentsAfternoon: z.number().min(0).optional(),
  gradeAfternoon: z.string().optional(),
  studentsNight: z.number().min(0).optional(),
  gradeNight: z.string().optional(),

  gradeProjection2026Morning: z.string().optional(),
  gradeProjection2026Afternoon: z.string().optional(),
  gradeProjection2026Night: z.string().optional(),
  
  gradeIntegral: z.string().optional(),
  gradeProjection2026Integral: z.string().optional(),

  hasTv: z.boolean().optional(),
  hasInternet: z.boolean().optional(),
  hasAirConditioning: z.boolean().optional(),
  hasCeiling: z.boolean().optional(),
  hasBathroom: z.boolean().optional(),
});

const teacherAllocationSchema = z.object({
    professionalId: z.string().optional(),
    contractType: z.string().optional(),
    workload: z.number().optional(),
    observations: z.string().optional(),
});

const classroomAllocationSchema = z.object({
    classroomId: z.string(),
    classroomName: z.string(),
    turn: z.enum(['morning', 'afternoon', 'night', 'integral']),
    grade: z.string(),
    teachers: z.array(teacherAllocationSchema),
});

const formSchema = z.object({
  schoolId: z.string().min(1, "Por favor, selecione uma escola."),
  dynamicData: z.record(z.any()),
  infrastructure: z.object({
      classrooms: z.array(classroomSchema)
  }).optional(),
  professionals: z.object({
      allocations: z.array(classroomAllocationSchema)
  }).optional(),
  professionalsList: z.array(z.any()).optional(), // Helper to pass list to context
});


const sectionIcons: { [key: string]: React.ElementType } = {
  general: Building,
  infra: HardHat,
  professionals: UserCog,
  tech: Laptop,
  cultural: Palette,
  maintenance: Wrench,
};

export const gradeLevels = [
    "Berçário I",
    "Berçário II",
    "Maternal I",
    "Maternal II",
    "Pré I",
    "Pré II",
    "1º Ano",
    "2º Ano",
    "3º Ano",
    "4º Ano",
    "5º Ano",
    "6º Ano",
    "7º Ano",
    "8º Ano",
    "9º Ano",
    "Não se aplica",
];

const workloadOptions = [20, 30, 40, 50];

const DynamicField = ({ control, fieldConfig }: { control: any, fieldConfig: FormFieldConfig }) => {
    const fieldName = `dynamicData.${fieldConfig.sectionId}.${fieldConfig.id}`;
    
    return (
        <FormField
            control={control}
            name={fieldName}
            rules={{ required: fieldConfig.required ? "Este campo é obrigatório" : false }}
            render={({ field, fieldState }) => (
                 <FormItem>
                    <FormLabel>{fieldConfig.name}</FormLabel>
                     <FormControl>
                        {fieldConfig.type === 'boolean' ? (
                           <div className="flex items-center space-x-2 pt-2 h-10">
                                <Checkbox
                                    id={fieldName}
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                <label
                                    htmlFor={fieldName}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Sim
                                </label>
                            </div>
                        ) : fieldConfig.type === 'number' ? (
                            <Input 
                                type="number" 
                                {...field} 
                                value={field.value ?? ''}
                                onChange={e => field.onChange(e.target.value === '' ? null : e.target.valueAsNumber)}
                            />
                        ) : (
                            <Input {...field} value={field.value ?? ''} />
                        )}
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
            )}
        />
    );
};


const InfrastructureSection = () => {
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "infrastructure.classrooms",
    });

    const addNewClassroom = () => {
        append({
            id: `room_${Date.now()}`,
            name: `Sala ${fields.length + 1}`,
            studentCapacity: 0,
            isAdapted: false,
            occupationType: 'turn',
            studentsMorning: 0,
            gradeMorning: "",
            studentsAfternoon: 0,
            gradeAfternoon: "",
            studentsNight: 0,
            gradeNight: "",
            gradeProjection2026Morning: "",
            gradeProjection2026Afternoon: "",
            gradeProjection2026Night: "",
            gradeIntegral: "",
            gradeProjection2026Integral: "",
            hasTv: false,
            hasInternet: false,
            hasAirConditioning: false,
            hasCeiling: false,
            hasBathroom: false,
        });
    };
    
    const watchedClassrooms = useWatch({ control, name: "infrastructure.classrooms" });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Infraestrutura</CardTitle>
                <CardDescription>Adicione as salas de aula e seus detalhes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Accordion type="multiple" className="w-full space-y-4">
                    {fields.map((item, index) => {
                        const classroomName = watchedClassrooms?.[index]?.name || `Sala ${index + 1}`;
                        const occupationType = watchedClassrooms?.[index]?.occupationType;
                        return (
                        <AccordionItem value={`item-${index}`} key={item.id} className="border-b-0">
                            <Card className="bg-muted/20">
                                 <div className="flex items-center p-4">
                                     <AccordionTrigger className="flex-1">
                                        <h4 className="font-bold text-left">{classroomName}</h4>
                                    </AccordionTrigger>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                                <AccordionContent className="px-4 pb-4">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={control}
                                                name={`infrastructure.classrooms.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Nome/Identificação da Sala</FormLabel>
                                                        <FormControl><Input {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField control={control} name={`infrastructure.classrooms.${index}.studentCapacity`} render={({ field }) => (<FormItem><FormLabel>Capacidade de Alunos</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? 0 : e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>)} />
                                        </div>
                                         <FormField control={control} name={`infrastructure.classrooms.${index}.isAdapted`} render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-2"><FormControl><Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Esta sala é adaptada</FormLabel></FormItem>)} />

                                        <Separator/>

                                        <FormField
                                            control={control}
                                            name={`infrastructure.classrooms.${index}.occupationType`}
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                <FormLabel>Tipo de Ocupação</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="flex flex-col space-y-1"
                                                    >
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                        <RadioGroupItem value="turn" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                        Por Turno (Manhã, Tarde, Noite)
                                                        </FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                        <RadioGroupItem value="integral" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                        Período Integral
                                                        </FormLabel>
                                                    </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {occupationType === 'integral' ? (
                                            <>
                                                <p className="font-medium text-sm">Ocupação Período Integral</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField control={control} name={`infrastructure.classrooms.${index}.gradeIntegral`} render={({ field }) => (<FormItem><FormLabel>Série - Integral</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ''}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{gradeLevels.map(grade => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                                    <div></div>
                                                    <FormField control={control} name={`infrastructure.classrooms.${index}.gradeProjection2026Integral`} render={({ field }) => (<FormItem><FormLabel>Projeção 2026 - Integral</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ''}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{gradeLevels.map(grade => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <p className="font-medium text-sm">Ocupação Atual por Turno</p>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-6">
                                                    <FormField control={control} name={`infrastructure.classrooms.${index}.gradeMorning`} render={({ field }) => (<FormItem><FormLabel>Série - Manhã</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ''}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{gradeLevels.map(grade => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                                    <FormField control={control} name={`infrastructure.classrooms.${index}.studentsMorning`} render={({ field }) => (<FormItem><FormLabel>Alunos - Manhã</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? 0 : e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>)} />
                                                    <div></div>
                                                    <FormField control={control} name={`infrastructure.classrooms.${index}.gradeAfternoon`} render={({ field }) => (<FormItem><FormLabel>Série - Tarde</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ''}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{gradeLevels.map(grade => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                                    <FormField control={control} name={`infrastructure.classrooms.${index}.studentsAfternoon`} render={({ field }) => (<FormItem><FormLabel>Alunos - Tarde</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? 0 : e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>)} />
                                                    <div></div>
                                                    <FormField control={control} name={`infrastructure.classrooms.${index}.gradeNight`} render={({ field }) => (<FormItem><FormLabel>Série - Noite</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ''}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{gradeLevels.map(grade => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                                    <FormField control={control} name={`infrastructure.classrooms.${index}.studentsNight`} render={({ field }) => (<FormItem><FormLabel>Alunos - Noite</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? 0 : e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>)} />
                                                </div>

                                                <Separator/>
                                                
                                                <p className="font-medium text-sm">Projeção 2026 por Turno</p>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <FormField control={control} name={`infrastructure.classrooms.${index}.gradeProjection2026Morning`} render={({ field }) => (<FormItem><FormLabel>Projeção Manhã</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ''}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{gradeLevels.map(grade => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                                    <FormField control={control} name={`infrastructure.classrooms.${index}.gradeProjection2026Afternoon`} render={({ field }) => (<FormItem><FormLabel>Projeção Tarde</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ''}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{gradeLevels.map(grade => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                                    <FormField control={control} name={`infrastructure.classrooms.${index}.gradeProjection2026Night`} render={({ field }) => (<FormItem><FormLabel>Projeção Noite</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ''}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{gradeLevels.map(grade => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                                </div>
                                            </>
                                        )}
                                        
                                        <Separator/>

                                        <p className="font-medium text-sm">Recursos da Sala</p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                                            <FormField control={control} name={`infrastructure.classrooms.${index}.hasTv`} render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Tem TV</FormLabel></FormItem>)} />
                                            <FormField control={control} name={`infrastructure.classrooms.${index}.hasInternet`} render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Tem Internet (WiFi)</FormLabel></FormItem>)} />
                                            <FormField control={control} name={`infrastructure.classrooms.${index}.hasAirConditioning`} render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Tem Ar Condicionado</FormLabel></FormItem>)} />
                                            <FormField control={control} name={`infrastructure.classrooms.${index}.hasCeiling`} render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Tem Forro</FormLabel></FormItem>)} />
                                            <FormField control={control} name={`infrastructure.classrooms.${index}.hasBathroom`} render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Tem Banheiro (Ed. Infantil)</FormLabel></FormItem>)} />
                                        </div>
                                    </div>
                                </AccordionContent>
                            </Card>
                        </AccordionItem>
                    )})})}
                </Accordion>
                 <Button type="button" variant="outline" onClick={addNewClassroom}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Sala de Aula
                </Button>
            </CardContent>
        </Card>
    );
};

const TeacherAllocationForm = ({ allocationIndex, teacherIndex, removeTeacher }: { allocationIndex: number, teacherIndex: number, removeTeacher: (index: number) => void }) => {
    const { control, watch } = useFormContext();
    const professionalsList = watch('professionalsList') as Professional[];
    
    const availableProfessionals = useMemo(() => {
        return professionalsList || [];
    }, [professionalsList]);


    return (
        <div className="p-4 border rounded-md bg-background relative space-y-4">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => removeTeacher(teacherIndex)}
            >
                <Trash2 className="h-4 w-4 text-destructive" />
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                 <FormField
                    control={control}
                    name={`professionals.allocations.${allocationIndex}.teachers.${teacherIndex}.professionalId`}
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Professor(a)</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn(
                                                "w-full justify-between",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value
                                                ? availableProfessionals.find(
                                                    (prof) => prof.id === field.value
                                                )?.name
                                                : "Selecione um profissional"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                                    <Command>
                                        <CommandInput placeholder="Buscar profissional..." />
                                        <CommandList>
                                            <CommandEmpty>Nenhum profissional encontrado.</CommandEmpty>
                                            <CommandGroup>
                                                {availableProfessionals.map((prof) => (
                                                    <CommandItem
                                                        value={prof.name}
                                                        key={prof.id}
                                                        onSelect={() => {
                                                            field.onChange(prof.id);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                prof.id === field.value
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        {prof.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name={`professionals.allocations.${allocationIndex}.teachers.${teacherIndex}.contractType`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Vínculo</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o vínculo" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {professionalContractTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <FormField
                    control={control}
                    name={`professionals.allocations.${allocationIndex}.teachers.${teacherIndex}.workload`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Carga Horária</FormLabel>
                            <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value ?? '')}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a carga" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {workloadOptions.map(wh => (
                                        <SelectItem key={wh} value={String(wh)}>{wh}h</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name={`professionals.allocations.${allocationIndex}.teachers.${teacherIndex}.observations`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Observações</FormLabel>
                             <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma observação" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {professionalObservationTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    )
}

const ProfessionalsAllocationSection = ({ professionalsList }: { professionalsList: Professional[] }) => {
    const { control, getValues, watch, setValue } = useFormContext();
    const classrooms = watch("infrastructure.classrooms") as Classroom[] || [];
    const { fields, replace } = useFieldArray({
        control,
        name: "professionals.allocations",
    });

    // Pass the full professionals list down to the context for the sub-form
    useEffect(() => {
        setValue('professionalsList', professionalsList);
    }, [professionalsList, setValue]);
    
    useEffect(() => {
        if (!classrooms) return;

        const newAllocations: Omit<ClassroomAllocation, 'teachers'>[] = [];
        classrooms.forEach(room => {
            if (!room.id) return;
            if (room.occupationType === 'integral' && room.gradeIntegral) {
                 newAllocations.push({
                    classroomId: room.id,
                    classroomName: room.name,
                    turn: 'integral',
                    grade: room.gradeIntegral,
                });
            } else if (room.occupationType === 'turn') {
                if (room.gradeMorning) {
                    newAllocations.push({
                        classroomId: room.id,
                        classroomName: room.name,
                        turn: 'morning',
                        grade: room.gradeMorning,
                    });
                }
                if (room.gradeAfternoon) {
                    newAllocations.push({
                        classroomId: room.id,
                        classroomName: room.name,
                        turn: 'afternoon',
                        grade: room.gradeAfternoon,
                    });
                }
                if (room.gradeNight) {
                    newAllocations.push({
                        classroomId: room.id,
                        classroomName: room.name,
                        turn: 'night',
                        grade: room.gradeNight,
                    });
                }
            }
        });

        const currentAllocations = getValues('professionals.allocations') || [];
        const mergedAllocations = newAllocations.map(newAlloc => {
            const existing = currentAllocations.find((a: ClassroomAllocation) => a.classroomId === newAlloc.classroomId && a.turn === newAlloc.turn);
            return existing ? { ...newAlloc, teachers: existing.teachers || [] } : { ...newAlloc, teachers: [] };
        });

        replace(mergedAllocations);
    }, [classrooms, getValues, replace]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Alocação de Profissionais</CardTitle>
                <CardDescription>Atribua um ou mais professores para cada turma cadastrada na aba de infraestrutura.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {fields.length === 0 ? (
                    <div className="text-center text-muted-foreground py-10">
                        <p>Nenhuma turma foi criada na aba de Infraestrutura ainda.</p>
                        <p>Adicione salas de aula e defina as séries para alocar os profissionais.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {(fields as (ClassroomAllocation & { id: string })[]).map((field, index) => {
                             const allocation = getValues(`professionals.allocations.${index}`) as ClassroomAllocation;
                             const room = classrooms.find(r => r.id === allocation.classroomId);

                             const { fields: teacherFields, append: appendTeacher, remove: removeTeacher } = useFieldArray({
                                control,
                                name: `professionals.allocations.${index}.teachers`
                             });
                             
                             let turnStudents, turnProjection;
                             if (allocation.turn === 'integral') {
                                turnStudents = room?.studentCapacity; // Assuming integral uses full capacity
                                turnProjection = room?.gradeProjection2026Integral;
                             } else {
                                turnStudents = allocation.turn === 'morning' ? room?.studentsMorning : allocation.turn === 'afternoon' ? room?.studentsAfternoon : room?.studentsNight;
                                turnProjection = allocation.turn === 'morning' ? room?.gradeProjection2026Morning : allocation.turn === 'afternoon' ? room?.gradeProjection2026Afternoon : room?.gradeProjection2026Night;
                             }

                             return (
                                <div key={field.id} className="p-4 border rounded-lg bg-muted/20 space-y-4">
                                    <div>
                                        <h4 className="font-bold">{allocation.classroomName}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Turno: <span className="font-medium capitalize">{allocation.turn === 'morning' ? 'Manhã' : allocation.turn === 'afternoon' ? 'Tarde' : allocation.turn === 'night' ? 'Noite' : 'Integral'}</span> | 
                                            Série: <span className="font-medium">{allocation.grade}</span> {turnStudents ? `(${turnStudents} alunos)` : ''}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Projeção 2026: <span className="font-medium">
                                                {turnProjection || 'N/A'}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="space-y-4 pl-4 border-l-2">
                                        {teacherFields.map((teacherField, teacherIndex) => (
                                            <TeacherAllocationForm 
                                                key={teacherField.id}
                                                allocationIndex={index}
                                                teacherIndex={teacherIndex}
                                                removeTeacher={removeTeacher}
                                            />
                                        ))}
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => appendTeacher({})}
                                        >
                                            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Professor
                                        </Button>
                                    </div>
                                </div>
                             )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};



export function SchoolCensusForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { settings: appSettings, loading: appLoading } = useAppSettings();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [formConfig, setFormConfig] = useState<FormSectionConfig[]>([]);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schoolId: "",
      dynamicData: {},
      infrastructure: { classrooms: [] },
      professionals: { allocations: [] },
      professionalsList: [],
    },
  });
  
  const generateDefaultValues = useCallback((config: FormSectionConfig[]) => {
      const defaultDynamicValues: { [key: string]: any } = {};
      
      config.forEach((section: FormSectionConfig) => {
          if (!section.id.startsWith('infra')) {
            defaultDynamicValues[section.id] = {};
            section.fields.forEach((field: FormFieldConfig) => {
                defaultDynamicValues[section.id][field.id] = 
                    field.type === 'boolean' ? false :
                    '';
            });
          }
      });
      return defaultDynamicValues;
  }, []);

  // Fetch schools and form config from Firestore
  useEffect(() => {
    if (appLoading || !db) return; // Wait for app settings and db to be ready
    
    const fetchInitialData = async () => {
        setIsConfigLoading(true);
        try {
            const schoolsQuery = collection(db, 'schools');
            const professionalsQuery = collection(db, 'professionals');
            const formConfigDocRef = doc(db, 'settings', 'formConfig');

            const [schoolsSnapshot, professionalsSnapshot, formConfigDoc] = await Promise.all([
                getDocs(schoolsQuery),
                getDocs(professionalsQuery),
                getDoc(formConfigDocRef)
            ]);

            const schoolsData = schoolsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as School[];
            setSchools(schoolsData);

            const professionalsData = professionalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Professional[];
            setProfessionals(professionalsData);

            let configData: FormSectionConfig[] = formConfigDoc.exists() ? formConfigDoc.data().sections : [];
            // Manually ensure the professionals section exists for older configs
             if (!configData.some(s => s.id === 'professionals')) {
                const infraIndex = configData.findIndex(s => s.id.startsWith('infra'));
                const newSection = {
                    id: 'professionals',
                    name: 'Profissionais',
                    description: 'Alocação de profissionais por turma.',
                    fields: []
                };
                if (infraIndex !== -1) {
                    configData.splice(infraIndex + 1, 0, newSection);
                } else {
                    configData.push(newSection);
                }
            }
            setFormConfig(configData);
            
            // Now that config is loaded, handle initial form state
            const schoolId = searchParams.get('schoolId');
            const defaultDynamicValues = generateDefaultValues(configData);
            let initialValues: z.infer<typeof formSchema> = {
                schoolId: schoolId || "",
                dynamicData: defaultDynamicValues,
                infrastructure: { classrooms: [] },
                professionals: { allocations: [] },
                professionalsList: professionalsData,
            };

            // Only attempt to load submission data if a school is selected and user is logged in
            if (schoolId && user) {
                const submissionDoc = await getDoc(doc(db, 'submissions', schoolId));
                if (submissionDoc.exists()) {
                    const existingSubmission = submissionDoc.data() as SchoolCensusSubmission;
                     const mergedDynamicData = produce(defaultDynamicValues, draft => {
                        if (existingSubmission.dynamicData) {
                            for (const sectionId in existingSubmission.dynamicData) {
                                if (draft[sectionId]) {
                                    Object.assign(draft[sectionId], existingSubmission.dynamicData[sectionId]);
                                } else {
                                    draft[sectionId] = existingSubmission.dynamicData[sectionId];
                                }
                            }
                        }
                    });
                    initialValues.dynamicData = mergedDynamicData;
                    if (existingSubmission.infrastructure?.classrooms) {
                        initialValues.infrastructure = existingSubmission.infrastructure;
                    }
                     if (existingSubmission.professionals?.allocations) {
                        initialValues.professionals = existingSubmission.professionals;
                    }
                }
            }
            form.reset(initialValues);

        } catch (error) {
            console.error("Failed to load config from Firestore", error);
            toast({ title: "Erro ao carregar configurações", variant: "destructive" });
        } finally {
            setIsConfigLoading(false);
        }
    }
    fetchInitialData();
  }, [searchParams, form, generateDefaultValues, appLoading, toast, user]);


  const handleSchoolChange = async (schoolId: string) => {
      if (!db || !user) return;
      router.push(`/census?schoolId=${schoolId}`, { scroll: false });
      
      const defaultValues = generateDefaultValues(formConfig);
      let resetValues: z.infer<typeof formSchema> = {
          schoolId,
          dynamicData: defaultValues,
          infrastructure: { classrooms: [] },
          professionals: { allocations: [] },
          professionalsList: professionals
      };
      
      const submissionDoc = await getDoc(doc(db, 'submissions', schoolId));

      if (submissionDoc.exists()) {
          const existingSubmission = submissionDoc.data() as SchoolCensusSubmission;
          const mergedDynamicData = produce(defaultValues, draft => {
              if(existingSubmission.dynamicData) {
                for (const sectionId in existingSubmission.dynamicData) {
                    if (draft[sectionId]) {
                        Object.assign(draft[sectionId], existingSubmission.dynamicData[sectionId]);
                    } else {
                         draft[sectionId] = existingSubmission.dynamicData[sectionId];
                    }
                }
              }
          });
          resetValues.dynamicData = mergedDynamicData;
          if (existingSubmission.infrastructure?.classrooms) {
              resetValues.infrastructure = existingSubmission.infrastructure;
          }
          if (existingSubmission.professionals?.allocations) {
              resetValues.professionals = existingSubmission.professionals;
          }
      } 
      form.reset(resetValues);
  };

  const cleanData = (data: any): any => {
    if (Array.isArray(data)) {
      return data.map(v => cleanData(v));
    }
    if (data !== null && typeof data === 'object' && !data._isFieldValue && !(data instanceof Date)) {
        if (data.toDate && typeof data.toDate === 'function') { // It's a Firestore Timestamp
            return data;
        }
        const cleaned: { [key: string]: any } = {};
        for (const key in data) {
            const value = data[key];
            if (value !== undefined) {
                 cleaned[key] = cleanData(value);
            }
        }
        return cleaned;
    }
    return data === undefined ? null : data;
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!db) {
        toast({ title: "Erro de Conexão", variant: "destructive"});
        return;
    }
    
    if (!user) {
        toast({ title: "Acesso Negado", description: "Você precisa estar logado para salvar os dados.", variant: "destructive"});
        return;
    }

    // Explicitly remove the helper field before submission
    const { professionalsList, ...submissionValues } = values;
    const { schoolId, dynamicData, infrastructure, professionals } = submissionValues;

    if (!schoolId) {
        toast({ title: "Erro", description: "Selecione uma escola primeiro.", variant: "destructive" });
        return;
    }

    try {
        const submissionRef = doc(db, 'submissions', schoolId);
        
        const statusUpdates: { [key: string]: { status: 'completed' } } = {};
        
        formConfig.forEach(sectionCfg => {
            const sectionId = sectionCfg.id.split('_')[0] as FormSectionPermission;
            const originalSectionId = sectionCfg.id;

            let isCompleted = false;
            if (sectionId === 'infra') {
                if (infrastructure && infrastructure.classrooms.length > 0) {
                     isCompleted = true;
                }
            } else if (sectionId === 'professionals') {
                if (professionals && professionals.allocations.some(a => a.teachers.length > 0 && a.teachers.some(t => t.professionalId))) {
                    isCompleted = true;
                }
            } else {
                const sectionData = dynamicData[originalSectionId];
                if (sectionData && Object.values(sectionData).some(v => v !== '' && v !== false && v !== null && v !== undefined)) {
                    isCompleted = true;
                }
            }
             if (isCompleted) {
                statusUpdates[sectionId] = { status: 'completed' };
             }
        });
        
        const submissionPayload = {
          id: schoolId,
          schoolId: schoolId,
          dynamicData,
          infrastructure,
          professionals,
          ...statusUpdates,
          submittedAt: serverTimestamp(),
          submittedBy: user?.uid || 'unknown'
        };

        const cleanedPayload = cleanData(submissionPayload);

        await setDoc(submissionRef, cleanedPayload, { merge: true });

        toast({
            title: "Sucesso!",
            description: "Informações salvas com sucesso. Você pode continuar editando.",
        });

    } catch (e) {
        console.error("Submission Error:", e);
        toast({ title: "Erro ao Salvar", description: "Não foi possível salvar os dados.", variant: "destructive" });
    }
  }
  
  const isAdmin = useMemo(() => userProfile?.role?.permissions.includes('users') ?? false, [userProfile]);

  const visibleSections = useMemo(() => {
    if (!userProfile?.role) {
      return [];
    }
    
    if (isAdmin) {
      return formConfig;
    }
    
    const userPermissions = userProfile.role!.permissions;
    return formConfig.filter(section => 
        userPermissions.some(p => section.id.startsWith(p))
    );
  }, [formConfig, userProfile, isAdmin]);
  
  if (isConfigLoading || appLoading || authLoading) {
      return (
          <Card>
              <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
              <CardContent><Skeleton className="h-40 w-full" /></CardContent>
              <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
          </Card>
      );
  }

  return (
    <Card>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
             <CardTitle>Identificação da Escola</CardTitle>
              <FormField
                    control={form.control}
                    name="schoolId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selecione a escola que está sendo recenseada</FormLabel>
                        <Select onValueChange={(value) => {
                            field.onChange(value);
                            handleSchoolChange(value);
                        }} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma escola" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {schools.map((school) => (
                              <SelectItem key={school.id} value={school.id}>
                                {school.name} (INEP: {school.inep})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
          </CardHeader>
          <CardContent className="pt-6">
            {!user && (
                 <div className="text-center text-muted-foreground py-10">
                    <p>Você precisa estar logado para preencher o formulário.</p>
                </div>
            )}
            {user && visibleSections.length > 0 && (
                 <Tabs defaultValue={visibleSections[0].id} className="w-full">
                  <TabsList className="mb-4 flex h-auto flex-wrap justify-start">
                      {visibleSections.map(section => {
                          const Icon = sectionIcons[section.id.split('_')[0]] || Building;
                          return (
                             <TabsTrigger key={section.id} value={section.id} className="flex-shrink-0 flex items-center gap-2"><Icon className="h-4 w-4"/>{section.name}</TabsTrigger>
                          )
                      })}
                  </TabsList>
                  
                  {visibleSections.map(section => {
                     if (section.id.startsWith('infra')) {
                        return (
                             <TabsContent key={section.id} value={section.id}>
                                <InfrastructureSection />
                            </TabsContent>
                        )
                     }
                      if (section.id === 'professionals') {
                        return (
                             <TabsContent key={section.id} value={section.id}>
                                <ProfessionalsAllocationSection professionalsList={professionals} />
                            </TabsContent>
                        )
                     }
                    if (section.id === 'general') {
                       const deskField = section.fields.find(f => f.id.startsWith('f_desk'));
                       const modalityFields = section.fields.filter(f => !f.id.startsWith('f_desk'));
                        return (
                        <TabsContent key={section.id} value={section.id}>
                            <Card>
                                <CardHeader>
                                <CardTitle>{section.name}</CardTitle>
                                {section.description && <CardDescription>{section.description}</CardDescription>}
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {deskField && <DynamicField key={deskField.id} control={form.control} fieldConfig={deskField} />}
                                        
                                        <Separator/>

                                        <p className="font-medium">Modalidades de Ensino Oferecidas</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {modalityFields.map(field => (
                                                <DynamicField key={field.id} control={form.control} fieldConfig={field} />
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )
                    }
                    return (
                        <TabsContent key={section.id} value={section.id}>
                            <Card>
                                <CardHeader>
                                <CardTitle>{section.name}</CardTitle>
                                {section.description && <CardDescription>{section.description}</CardDescription>}
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {section.fields.filter(f => f.type !== 'boolean').map(field => (
                                            <DynamicField key={field.id} control={form.control} fieldConfig={field} />
                                        ))}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {section.fields.filter(f => f.type === 'boolean').map(field => (
                                                <DynamicField key={field.id} control={form.control} fieldConfig={field} />
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )
                  })}
                 
                </Tabs>
            )}
             {user && visibleSections.length === 0 && (
                <div className="text-center text-muted-foreground py-10">
                    <p>Seu perfil não tem permissão para editar nenhuma seção do formulário.</p>
                    <p>Por favor, entre em contato com um administrador.</p>
                </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={!form.getValues('schoolId') || form.formState.isSubmitting || !user}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {user ? 'Salvar Informações' : 'Faça login para salvar'}
            </Button>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
}
