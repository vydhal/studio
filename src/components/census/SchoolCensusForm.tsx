
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";

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
import type { School } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const classroomSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome da turma é obrigatório"),
  studentCapacity: z.coerce.number().min(0, "Capacidade deve ser positiva"),
  outlets: z.coerce.number().min(0, "Número deve ser positivo"),
  tvCount: z.coerce.number().min(0, "Número deve ser positivo"),
  chairCount: z.coerce.number().min(0, "Número deve ser positivo"),
  fanCount: z.coerce.number().min(0, "Número deve ser positivo"),
  hasInternet: z.boolean(),
  hasAirConditioning: z.boolean(),
});

const teachingModalitySchema = z.object({
  id: z.string(),
  name: z.string(),
  offered: z.boolean(),
});

const technologyResourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.coerce.number().min(0, "Quantidade deve ser positiva"),
});

const formSchema = z.object({
  schoolId: z.string().min(1, "Por favor, selecione uma escola."),
  classrooms: z.array(classroomSchema).min(1, "Adicione pelo menos uma turma."),
  teachingModalities: z.array(teachingModalitySchema),
  technologyResources: z.array(technologyResourceSchema),
  hasInternet: z.boolean(),
});

const defaultModalities = [
    { id: '1', name: 'Anos Iniciais', offered: false },
    { id: '2', name: 'Anos Finais', offered: false },
    { id: '3', name: 'EJA', offered: false },
    { id: '4', name: 'Integral', offered: false },
    { id: '5', name: 'Bilíngue', offered: false },
];

const defaultTechnologies = [
    { id: '1', name: 'Kits de Robótica', quantity: 0 },
    { id: '2', name: 'Chromebooks', quantity: 0 },
    { id: '3', name: 'Notebooks', quantity: 0 },
    { id: '4', name: 'Modems', quantity: 0 },
    { id: '5', name: 'Impressoras', quantity: 0 },
    { id: '6', name: 'Modems com Defeito', quantity: 0 },
];

const mockSchools: School[] = [
    { id: 'school1', name: 'Escola Municipal Exemplo 1', inep: '12345678' },
    { id: 'school2', name: 'Escola Estadual Teste 2', inep: '87654321' },
    { id: 'school3', name: 'Centro Educacional Modelo 3', inep: '98765432' },
];

export function SchoolCensusForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schoolId: "",
      classrooms: [{ 
        id: 'c1', 
        name: 'Sala 1', 
        studentCapacity: 0,
        outlets: 0,
        tvCount: 0,
        chairCount: 0,
        fanCount: 0,
        hasInternet: false,
        hasAirConditioning: false
      }],
      teachingModalities: defaultModalities,
      technologyResources: defaultTechnologies,
      hasInternet: false,
    },
  });
  
  const { fields: classrooms, append: appendClassroom, remove: removeClassroom } = useFieldArray({ control: form.control, name: "classrooms" });
  const { fields: modalities } = useFieldArray({ control: form.control, name: "teachingModalities" });
  const { fields: technologies } = useFieldArray({ control: form.control, name: "technologyResources" });

  useEffect(() => {
    // Simulate fetching schools
    setSchools(mockSchools);
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    // Simulate submitting to Firestore
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
    form.reset({
        schoolId: "",
        classrooms: [{
        id: `c1`,
        name: 'Sala 1',
        studentCapacity: 0,
        outlets: 0,
        tvCount: 0,
        chairCount: 0,
        fanCount: 0,
        hasInternet: false,
        hasAirConditioning: false
        }],
        teachingModalities: defaultModalities,
        technologyResources: defaultTechnologies,
        hasInternet: false,
    });
    setLoading(false);
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="pt-6">
            <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3', 'item-4']} className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="font-bold">Identificação da Escola</AccordionTrigger>
                <AccordionContent>
                  <FormField
                    control={form.control}
                    name="schoolId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Escola</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="font-bold">Salas de Aula</AccordionTrigger>
                <AccordionContent>
                  {classrooms.map((field, index) => (
                    <div key={field.id} className="mb-4 p-4 border rounded-md relative space-y-4">
                       <div className="flex justify-between items-start">
                         <FormField
                            control={form.control}
                            name={`classrooms.${index}.name`}
                            render={({ field }) => (
                              <FormItem className="flex-1 mr-4">
                                <FormLabel>Nome da Sala</FormLabel>
                                <FormControl><Input placeholder="Ex: Sala 1" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeClassroom(index)} className="mt-2">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                       </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <FormField control={form.control} name={`classrooms.${index}.outlets`} render={({ field }) => (
                            <FormItem><FormLabel>Número de Tomadas</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                          )}/>
                          <FormField control={form.control} name={`classrooms.${index}.tvCount`} render={({ field }) => (
                            <FormItem><FormLabel>Quantidade de TVs</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                          )}/>
                          <FormField control={form.control} name={`classrooms.${index}.chairCount`} render={({ field }) => (
                            <FormItem><FormLabel>Número de Cadeiras</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                          )}/>
                          <FormField control={form.control} name={`classrooms.${index}.studentCapacity`} render={({ field }) => (
                            <FormItem><FormLabel>Capacidade de Estudantes</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                          )}/>
                          <FormField control={form.control} name={`classrooms.${index}.fanCount`} render={({ field }) => (
                            <FormItem><FormLabel>Quantidade de Ventiladores</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                          )}/>
                        </div>
                        <div className="flex items-center space-x-4">
                          <FormField control={form.control} name={`classrooms.${index}.hasInternet`} render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                              <FormLabel className="font-normal">Tem Internet</FormLabel>
                            </FormItem>
                          )}/>
                          <FormField control={form.control} name={`classrooms.${index}.hasAirConditioning`} render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                              <FormLabel className="font-normal">Tem Ar Condicionado</FormLabel>
                            </FormItem>
                          )}/>
                        </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendClassroom({
                     id: `c${classrooms.length+1}`,
                     name: `Sala ${classrooms.length+1}`,
                     studentCapacity: 0,
                     outlets: 0,
                     tvCount: 0,
                     chairCount: 0,
                     fanCount: 0,
                     hasInternet: false,
                     hasAirConditioning: false
                  })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Sala de Aula
                  </Button>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="font-bold">Modalidades de Ensino</AccordionTrigger>
                <AccordionContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {modalities.map((field, index) => (
                           <FormField
                            key={field.id}
                            control={form.control}
                            name={`teachingModalities.${index}.offered`}
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <FormLabel className="font-normal">{modalities[index].name}</FormLabel>
                                </FormItem>
                            )}
                            />
                        ))}
                    </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="font-bold">Recursos Tecnológicos</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                    {technologies.map((field, index) => (
                       <FormField
                        key={field.id}
                        control={form.control}
                        name={`technologyResources.${index}.quantity`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{technologies[index].name}</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    ))}
                  </div>
                   <div className="mt-4">
                        <FormField
                            control={form.control}
                            name="hasInternet"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <FormLabel className="font-normal">A escola tem Internet</FormLabel>
                                </FormItem>
                            )}
                        />
                    </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Censo
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
