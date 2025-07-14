
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import {
  Form,
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
import { useToast } from "@/hooks/use-toast";
import type { School, FormSectionConfig, FormFieldConfig, SchoolCensusSubmission } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Loader2, Building, HardHat, Laptop, Palette, Wrench } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { produce } from "immer";
import { useAppSettings } from "@/context/AppContext";

const staticFormSchema = z.object({
  schoolId: z.string().min(1, "Por favor, selecione uma escola."),
  dynamicData: z.record(z.any()),
});

const defaultSections: FormSectionConfig[] = [
    { 
        id: 'general', 
        name: 'Dados Gerais',
        description: 'Seção de dados gerais da escola.',
        fields: [{ id: 'f_default_1', name: 'Nome do Diretor', type: 'text', required: true, sectionId: 'general' }] 
    }
];

const defaultSchools: School[] = [
    { id: 'school1', name: 'Escola Municipal Exemplo 1 (Padrão)', inep: '12345678' },
    { id: 'school2', name: 'Escola Estadual Teste 2 (Padrão)', inep: '87654321' },
    { id: 'school3', name: 'Centro Educacional Modelo 3 (Padrão)', inep: '98765432' },
];

const FORM_CONFIG_STORAGE_KEY = 'censusFormConfig';
const SCHOOLS_STORAGE_KEY = 'schoolList';
const SUBMISSIONS_STORAGE_KEY = 'schoolCensusSubmissions';


const sectionIcons: { [key: string]: React.ElementType } = {
  general: Building,
  infrastructure: HardHat,
  technology: Laptop,
  cultural: Palette,
  maintenance: Wrench,
};

const DynamicField = ({ control, fieldConfig }: { control: any, fieldConfig: FormFieldConfig }) => {
    const fieldName = `dynamicData.${fieldConfig.sectionId}.${fieldConfig.id}`;
    
    return (
        <FormField
            control={control}
            name={fieldName}
            rules={{ required: fieldConfig.required ? "Este campo é obrigatório" : false }}
            render={({ field, fieldState }) => (
                 <FormItem className="flex flex-col space-y-2">
                    <FormLabel>{fieldConfig.name}</FormLabel>
                     <FormControl>
                      <div>
                        {fieldConfig.type === 'text' && <Input {...field} />}
                        {fieldConfig.type === 'number' && <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />}
                        {fieldConfig.type === 'boolean' && (
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
                        )}
                      </div>
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
            )}
        />
    );
};


export function SchoolCensusForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loading: appLoading } = useAppSettings();
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [formConfig, setFormConfig] = useState<FormSectionConfig[]>([]);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  const form = useForm<z.infer<typeof staticFormSchema>>({
    resolver: zodResolver(staticFormSchema),
    defaultValues: {
      schoolId: "",
      dynamicData: {},
    },
  });

  const getSubmissions = (): Record<string, SchoolCensusSubmission> => {
    try {
        const stored = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        return {};
    }
  };
  
  const generateDefaultValues = useCallback((config: FormSectionConfig[]) => {
      const defaultDynamicValues: { [key: string]: any } = {};
      config.forEach((section: FormSectionConfig) => {
          defaultDynamicValues[section.id] = {};
          section.fields.forEach((field: FormFieldConfig) => {
              defaultDynamicValues[section.id][field.id] = field.type === 'boolean' ? false : (field.type === 'number' ? null : '');
          });
      });
      return defaultDynamicValues;
  }, []);

  useEffect(() => {
    if (appLoading) return; // Wait for app settings to load
    try {
        const storedSchools = localStorage.getItem(SCHOOLS_STORAGE_KEY);
        setSchools(storedSchools ? JSON.parse(storedSchools) : defaultSchools);

        const storedConfig = localStorage.getItem(FORM_CONFIG_STORAGE_KEY);
        const parsedConfig = storedConfig ? JSON.parse(storedConfig) : defaultSections;
        setFormConfig(parsedConfig);
        
        const schoolId = searchParams.get('schoolId');
        const defaultDynamicValues = generateDefaultValues(parsedConfig);

        let initialValues = {
            schoolId: schoolId || "",
            dynamicData: defaultDynamicValues
        };

        if (schoolId) {
            const submissions = getSubmissions();
            const existingSubmission = submissions[schoolId];
            if (existingSubmission?.dynamicData) {
                 // Deep merge existing data with defaults to ensure all fields are present
                const mergedDynamicData = produce(defaultDynamicValues, draft => {
                    for (const sectionId in existingSubmission.dynamicData) {
                        if (draft[sectionId]) {
                            Object.assign(draft[sectionId], existingSubmission.dynamicData[sectionId]);
                        } else {
                            draft[sectionId] = existingSubmission.dynamicData[sectionId];
                        }
                    }
                });
                initialValues.dynamicData = mergedDynamicData;
            }
        }
        form.reset(initialValues);

    } catch (error) {
        console.error("Failed to load config from localStorage", error);
        setSchools(defaultSchools);
        setFormConfig(defaultSections);
    } finally {
        setIsConfigLoading(false);
    }
  }, [searchParams, form, generateDefaultValues, appLoading]);


  const handleSchoolChange = (schoolId: string) => {
      // Update URL without full page reload
      router.push(`/census?schoolId=${schoolId}`, { scroll: false });

      const submissions = getSubmissions();
      const existingSubmission = submissions[schoolId];
      const defaultValues = generateDefaultValues(formConfig);
      
      if (existingSubmission?.dynamicData) {
            const mergedDynamicData = produce(defaultValues, draft => {
                for (const sectionId in existingSubmission.dynamicData) {
                    if (draft[sectionId]) {
                        Object.assign(draft[sectionId], existingSubmission.dynamicData[sectionId]);
                    } else {
                         draft[sectionId] = existingSubmission.dynamicData[sectionId];
                    }
                }
            });
            form.reset({ schoolId, dynamicData: mergedDynamicData });
      } else {
          form.reset({ schoolId, dynamicData: defaultValues });
      }
  };

  async function onSubmit(values: z.infer<typeof staticFormSchema>) {
    setLoading(true);
    
    try {
        const { schoolId, dynamicData } = values;
        if (!schoolId) {
            toast({ title: "Erro", description: "Selecione uma escola primeiro.", variant: "destructive" });
            setLoading(false);
            return;
        }

        const allSubmissions = getSubmissions();
        
        const updatedSubmission = produce(allSubmissions[schoolId] || {
            id: schoolId,
            schoolId: schoolId,
            submittedAt: new Date(),
        }, (draft: SchoolCensusSubmission) => {
            if (!draft.dynamicData) {
              draft.dynamicData = {};
            }
            // Merge the new data into the draft
            for (const sectionId in dynamicData) {
              if (!draft.dynamicData[sectionId]) {
                draft.dynamicData[sectionId] = {};
              }
              Object.assign(draft.dynamicData[sectionId], dynamicData[sectionId]);
            }

            draft.submittedAt = new Date();
             
            // Naive status update - if a section has data, mark it completed
            formConfig.forEach(sectionCfg => {
                if (dynamicData[sectionCfg.id] && Object.values(dynamicData[sectionCfg.id]).some(v => v !== '' && v !== false && v !== null)) {
                    const sectionKey = sectionCfg.id as keyof SchoolCensusSubmission;
                    if (!draft[sectionKey]) {
                        (draft as any)[sectionKey] = {};
                    }
                    (draft as any)[sectionKey].status = 'completed';
                }
            });
        });
        
        allSubmissions[schoolId] = updatedSubmission;
        localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(allSubmissions));

        await new Promise(resolve => setTimeout(resolve, 500));
        toast({
            title: "Sucesso!",
            description: "Informações salvas com sucesso. Você pode continuar editando.",
        });

    } catch (e) {
        console.error("Submission Error:", e);
        toast({ title: "Erro ao Salvar", description: "Não foi possível salvar os dados.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }

  if (isConfigLoading || appLoading) {
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
             <Tabs defaultValue={formConfig.length > 0 ? formConfig[0].id : ''} className="w-full">
              <TabsList className="mb-4 h-auto flex-wrap justify-start">
                  {formConfig.map(section => {
                      const Icon = sectionIcons[section.id.split('_')[0]] || Building;
                      return (
                         <TabsTrigger key={section.id} value={section.id} className="flex-shrink-0 flex items-center gap-2"><Icon className="h-4 w-4"/>{section.name}</TabsTrigger>
                      )
                  })}
              </TabsList>
              
              {formConfig.map(section => (
                 <TabsContent key={section.id} value={section.id}>
                    <Card>
                        <CardHeader>
                          <CardTitle>{section.name}</CardTitle>
                          {section.description && <CardDescription>{section.description}</CardDescription>}
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {section.fields.map(field => (
                                    <DynamicField key={field.id} control={form.control} fieldConfig={field} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                 </TabsContent>
              ))}
             
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading || !form.getValues('schoolId')}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Informações
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

    