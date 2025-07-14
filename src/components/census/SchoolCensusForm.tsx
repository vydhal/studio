"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
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
import { db } from "@/lib/firebase";
import type { School } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
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
  name: z.string().min(1, "Nome da modalidade é obrigatório"),
  studentCount: z.coerce.number().min(0, "Número de alunos deve ser positivo"),
});

const technologySchema = z.object({
  id: z.string(),
  name: z.string(),
  hasIt: z.boolean(),
});

const formSchema = z.object({
  schoolId: z.string().min(1, "Por favor, selecione uma escola."),
  classrooms: z.array(classroomSchema).min(1, "Adicione pelo menos uma turma."),
  teachingModalities: z.array(teachingModalitySchema).min(1, "Adicione pelo menos uma modalidade."),
  technologies: z.array(technologySchema),
});

const defaultTechnologies = [
    { id: '1', name: 'Internet Banda Larga', hasIt: false },
    { id: '2', name: 'Laboratório de Informática', hasIt: false },
    { id: '3', name: 'Lousa Digital', hasIt: false },
    { id: '4', name: 'Projetor Multimídia', hasIt: false },
    { id: '5', name: 'Tablets para Alunos', hasIt: false },
]

export function SchoolCensusForm() {
  const { toast } = useToast();
  const { user } = useAuth();
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
      teachingModalities: [{ id: 'm1', name: 'Ensino Fundamental', studentCount: 250 }],
      technologies: defaultTechnologies,
    },
  });
  
  const { fields: classrooms, append: appendClassroom, remove: removeClassroom } = useFieldArray({ control: form.control, name: "classrooms" });
  const { fields: modalities, append: appendModality, remove: removeModality } = useFieldArray({ control: form.control, name: "teachingModalities" });
  const { fields: technologies } = useFieldArray({ control: form.control, name: "technologies" });

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const schoolsCollection = collection(db, "schools");
        const schoolSnapshot = await getDocs(schoolsCollection);
        const schoolList = schoolSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School));
        setSchools(schoolList);
      } catch (error) {
        toast({ variant: "destructive", title: "Erro ao carregar escolas", description: "Não foi possível buscar a lista de escolas." });
      }
    };
    fetchSchools();
  }, [toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      await addDoc(collection(db, "submissions"), {
        ...values,
        submittedAt: serverTimestamp(),
        submittedBy: user?.uid ?? "anonymous",
      });
      toast({
        title: "Sucesso!",
        description: "Formulário do censo enviado com sucesso.",
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
        teachingModalities: [{ id: 'm1', name: '', studentCount: 0 }],
        technologies: defaultTechnologies,
      });
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar",
        description: "Houve um problema ao enviar seu formulário. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
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
                  {modalities.map((field, index) => (
                      <div key={field.id} className="flex gap-2 items-end mb-4 p-4 border rounded-md relative">
                        <FormField
                            control={form.control}
                            name={`teachingModalities.${index}.name`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                <FormLabel>Nome da Modalidade</FormLabel>
                                <FormControl><Input placeholder="Ex: Ensino Médio" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        <FormField
                          control={form.control}
                          name={`teachingModalities.${index}.studentCount`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Alunos</FormLabel>
                              <FormControl><Input type="number" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <Button type="button" variant="ghost" size="icon" onClick={() => removeModality(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendModality({ id: `m${modalities.length+2}`, name: '', studentCount: 0 })}>
                     <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Modalidade
                  </Button>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="font-bold">Recursos Tecnológicos</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {technologies.map((field, index) => (
                       <FormField
                        key={field.id}
                        control={form.control}
                        name={`technologies.${index}.hasIt`}
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>{technologies[index].name}</FormLabel>
                                </div>
                                <FormControl>
                                    <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                        />
                    ))}
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
