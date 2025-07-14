
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';

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
import type { School, FormSectionConfig, FormFieldConfig } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Loader2, Building, HardHat, Laptop, Palette, Wrench } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// Zod schema for the school selection part, which is always static
const staticFormSchema = z.object({
  schoolId: z.string().min(1, "Por favor, selecione uma escola."),
  // The 'dynamicData' part will be validated manually or with a generated schema
  dynamicData: z.record(z.any()),
});

// Default form configuration if nothing is in localStorage
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

const sectionIcons: { [key: string]: React.ElementType } = {
  general: Building,
  infra: HardHat,
  tech: Laptop,
  cultural: Palette,
  maint: Wrench,
};

const DynamicField = ({ control, fieldConfig }: { control: any, fieldConfig: FormFieldConfig }) => {
    const fieldName = `dynamicData.${fieldConfig.id}`;
    
    return (
        <FormField
            control={control}
            name={fieldName}
            rules={{ required: fieldConfig.required ? "Este campo é obrigatório" : false }}
            render={({ field, fieldState }) => (
                <FormItem>
                    <FormLabel>{fieldConfig.name}</FormLabel>
                     <FormControl>
                        <div>
                           {fieldConfig.type === 'text' && <Input {...field} />}
                            {fieldConfig.type === 'number' && <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />}
                            {fieldConfig.type === 'boolean' && (
                                <div className="flex items-center space-x-2 pt-2">
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
                            {/* Add other field types here */}
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

  useEffect(() => {
    // Fetch schools and form config from localStorage
    try {
        const storedSchools = localStorage.getItem(SCHOOLS_STORAGE_KEY);
        setSchools(storedSchools ? JSON.parse(storedSchools) : defaultSchools);

        const storedConfig = localStorage.getItem(FORM_CONFIG_STORAGE_KEY);
        const parsedConfig = storedConfig ? JSON.parse(storedConfig) : defaultSections;
        setFormConfig(parsedConfig);
        
        // Set default values for dynamic fields
        const defaultDynamicValues: { [key: string]: any } = {};
        parsedConfig.forEach((section: FormSectionConfig) => {
            section.fields.forEach((field: FormFieldConfig) => {
                defaultDynamicValues[field.id] = field.type === 'boolean' ? false : '';
            });
        });
        form.reset({
            schoolId: form.getValues('schoolId'), // keep existing schoolId
            dynamicData: defaultDynamicValues,
        });

    } catch (error) {
        console.error("Failed to load config from localStorage", error);
        setSchools(defaultSchools);
        setFormConfig(defaultSections);
    } finally {
        setIsConfigLoading(false);
    }

    const schoolId = searchParams.get('schoolId');
    if (schoolId) {
        form.setValue('schoolId', schoolId);
    }
  }, [searchParams, form]);

  async function onSubmit(values: z.infer<typeof staticFormSchema>) {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Mock submission:", {
        ...values,
        submittedAt: new Date(),
        submittedBy: "test-user-id",
    });
    toast({
        title: "Sucesso!",
        description: "Formulário do censo enviado (simulação).",
    });
    setLoading(false);
  }

  if (isConfigLoading) {
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
                        <Select onValueChange={field.onChange} value={field.value}>
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
            <Tabs defaultValue={formConfig[0]?.id || 'default'} className="w-full">
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 lg:grid-cols-5 mb-4">
                  {formConfig.map(section => {
                      const Icon = sectionIcons[section.id.toLowerCase()] || Building;
                      return (
                         <TabsTrigger key={section.id} value={section.id}><Icon className="mr-2"/>{section.name}</TabsTrigger>
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
                        <CardContent className="space-y-4">
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Informações
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
