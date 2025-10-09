
"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { School, FormSectionConfig, FormFieldConfig, SchoolCensusSubmission, Classroom } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Loader2, Building, HardHat, Laptop, Palette, Wrench, PlusCircle, Trash2 } from "lucide-react";
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


const classroomSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "O nome da sala é obrigatório."),
  studentCapacity: z.number().min(0).optional(),
  outlets: z.number().min(0).optional(),
  tvCount: z.number().min(0).optional(),
  chairCount: z.number().min(0).optional(),
  fanCount: z.number().min(0).optional(),
  hasInternet: z.boolean().optional(),
  hasAirConditioning: z.boolean().optional(),
  gradeMorning: z.string().optional(),
  gradeAfternoon: z.string().optional(),
  gradeProjection2026Morning: z.string().optional(),
  gradeProjection2026Afternoon: z.string().optional(),
});

const formSchema = z.object({
  schoolId: z.string().min(1, "Por favor, selecione uma escola."),
  dynamicData: z.record(z.any()),
  infrastructure: z.object({
      classrooms: z.array(classroomSchema)
  }).optional(),
});


const sectionIcons: { [key: string]: React.ElementType } = {
  general: Building,
  infra: HardHat,
  tech: Laptop,
  cultural: Palette,
  maintenance: Wrench,
};

const gradeLevels = [
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


const InfrastructureSection = ({ control }: { control: any }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "infrastructure.classrooms",
    });

    const addNewClassroom = () => {
        append({
            id: `sala_${Date.now()}`,
            name: `Sala ${fields.length + 1}`,
            studentCapacity: 0,
            outlets: 0,
            tvCount: 0,
            chairCount: 0,
            fanCount: 0,
            hasInternet: false,
            hasAirConditioning: false,
            gradeMorning: '',
            gradeAfternoon: '',
            gradeProjection2026Morning: '',
            gradeProjection2026Afternoon: '',
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Infraestrutura</CardTitle>
                <CardDescription>Adicione as salas de aula e seus detalhes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Accordion type="multiple" className="w-full space-y-4">
                    {fields.map((item, index) => (
                        <AccordionItem value={`item-${index}`} key={item.id} className="border-b-0">
                            <Card className="bg-muted/20">
                                 <div className="flex items-center p-4">
                                     <AccordionTrigger className="flex-1">
                                        <h4 className="font-bold text-left">{`Sala ${index + 1}`}</h4>
                                    </AccordionTrigger>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                                <AccordionContent className="px-4 pb-4">
                                    <div className="space-y-4">
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
                                        
                                        <Separator/>
                                        
                                        <p className="font-medium text-sm">Ocupação Atual</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={control} name={`infrastructure.classrooms.${index}.gradeMorning`} render={({ field }) => (<FormItem><FormLabel>Série - Manhã</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione a série" /></SelectTrigger></FormControl><SelectContent>{gradeLevels.map(grade => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                            <FormField control={control} name={`infrastructure.classrooms.${index}.gradeAfternoon`} render={({ field }) => (<FormItem><FormLabel>Série - Tarde</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione a série" /></SelectTrigger></FormControl><SelectContent>{gradeLevels.map(grade => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                        </div>

                                        <Separator/>

                                        <p className="font-medium text-sm">Projeção 2026</p>
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={control} name={`infrastructure.classrooms.${index}.gradeProjection2026Morning`} render={({ field }) => (<FormItem><FormLabel>Projeção Manhã 2026</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione a série" /></SelectTrigger></FormControl><SelectContent>{gradeLevels.map(grade => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                            <FormField control={control} name={`infrastructure.classrooms.${index}.gradeProjection2026Afternoon`} render={({ field }) => (<FormItem><FormLabel>Projeção Tarde 2026</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione a série" /></SelectTrigger></FormControl><SelectContent>{gradeLevels.map(grade => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                        </div>

                                        <Separator/>
                                        
                                        <p className="font-medium text-sm">Recursos da Sala</p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <FormField control={control} name={`infrastructure.classrooms.${index}.studentCapacity`} render={({ field }) => (<FormItem><FormLabel>Capacidade Alunos</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={control} name={`infrastructure.classrooms.${index}.chairCount`} render={({ field }) => (<FormItem><FormLabel>Nº de Cadeiras</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={control} name={`infrastructure.classrooms.${index}.outlets`} render={({ field }) => (<FormItem><FormLabel>Nº de Tomadas</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}/></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={control} name={`infrastructure.classrooms.${index}.tvCount`} render={({ field }) => (<FormItem><FormLabel>Nº de TVs</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={control} name={`infrastructure.classrooms.${index}.fanCount`} render={({ field }) => (<FormItem><FormLabel>Nº de Ventiladores</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                                        </div>
                                        <div className="flex items-center gap-6 pt-2">
                                            <FormField control={control} name={`infrastructure.classrooms.${index}.hasInternet`} render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Tem Internet</FormLabel></FormItem>)} />
                                            <FormField control={control} name={`infrastructure.classrooms.${index}.hasAirConditioning`} render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Tem Ar Condicionado</FormLabel></FormItem>)} />
                                        </div>
                                    </div>
                                </AccordionContent>
                            </Card>
                        </AccordionItem>
                    ))}
                </Accordion>
                 <Button type="button" variant="outline" onClick={addNewClassroom}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Sala de Aula
                </Button>
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
  const [formConfig, setFormConfig] = useState<FormSectionConfig[]>([]);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schoolId: "",
      dynamicData: {},
      infrastructure: {
          classrooms: []
      }
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
    
    const fetchConfigAndSchools = async () => {
        setIsConfigLoading(true);
        try {
            const schoolsQuery = collection(db, 'schools');
            const formConfigDocRef = doc(db, 'settings', 'formConfig');

            const [schoolsSnapshot, formConfigDoc] = await Promise.all([
                getDocs(schoolsQuery),
                getDoc(formConfigDocRef)
            ]);

            const schoolsData = schoolsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as School[];
            setSchools(schoolsData);

            let configData: FormSectionConfig[] = formConfigDoc.exists() ? formConfigDoc.data().sections : [];
            // Manually ensure the general section has the desk field for older configs
            let generalSection = configData.find((s: FormSectionConfig) => s.id === 'general');
            if (generalSection && !generalSection.fields.some((f: FormFieldConfig) => f.id.startsWith('f_desk'))) {
                generalSection.fields.unshift({ id: 'f_desk_1', name: 'Total de Carteiras na Unidade', type: 'number', required: false, sectionId: 'general' });
            }

            setFormConfig(configData);
            
            // Now that config is loaded, handle initial form state
            const schoolId = searchParams.get('schoolId');
            const defaultDynamicValues = generateDefaultValues(configData);
            let initialValues: z.infer<typeof formSchema> = {
                schoolId: schoolId || "",
                dynamicData: defaultDynamicValues,
                infrastructure: { classrooms: [] }
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
    fetchConfigAndSchools();
  }, [searchParams, form, generateDefaultValues, appLoading, toast, user]);


  const handleSchoolChange = async (schoolId: string) => {
      if (!db || !user) return;
      router.push(`/census?schoolId=${schoolId}`, { scroll: false });
      
      const defaultValues = generateDefaultValues(formConfig);
      let resetValues: z.infer<typeof formSchema> = {
          schoolId,
          dynamicData: defaultValues,
          infrastructure: { classrooms: [] }
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
      } 
      form.reset(resetValues);
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

    const { schoolId, dynamicData, infrastructure } = values;
    if (!schoolId) {
        toast({ title: "Erro", description: "Selecione uma escola primeiro.", variant: "destructive" });
        return;
    }

    try {
        const submissionRef = doc(db, 'submissions', schoolId);
        
        // Mark sections with any data as 'completed'
        const statusUpdates: { [key: string]: { status: 'completed' } } = {};
        visibleSections.forEach(sectionCfg => {
            const sectionId = sectionCfg.id.split('_')[0];
            const originalSectionId = sectionCfg.id;

            let isCompleted = false;
            if (sectionId === 'infra') {
                if (infrastructure && infrastructure.classrooms.length > 0) {
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
        
        const submissionData = {
          id: schoolId,
          schoolId: schoolId,
          dynamicData,
          infrastructure,
          ...statusUpdates,
          submittedAt: serverTimestamp(),
          submittedBy: user?.uid || 'unknown'
        };

        await setDoc(submissionRef, submissionData, { merge: true });

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
    
    // Admins with 'users' permission see all sections.
    if (isAdmin) {
      return formConfig;
    }
    
    // Other users see only the sections their role permits.
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
      <Form {...form}>
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
                                <InfrastructureSection control={form.control} />
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
      </Form>
    </Card>
  );
}
