
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { School } from "@/types";

const schoolListSchema = z.object({
  schoolsJson: z.string().refine((val) => {
    try {
      const parsed = JSON.parse(val);
      // Now only validates for name and inep, id is optional.
      return Array.isArray(parsed) && parsed.every(item => typeof item === 'object' && 'name' in item && 'inep' in item);
    } catch (e) {
      return false;
    }
  }, {
    message: "O JSON fornecido é inválido. Verifique se é um array de objetos, onde cada objeto deve conter as chaves 'name' e 'inep'. Ex: [{\"name\": \"...\", \"inep\": \"...\"}]",
  }),
});

const defaultSchools: School[] = [
  { id: 'school1', name: 'Escola Municipal Exemplo 1 (Padrão)', inep: '12345678' },
  { id: 'school2', name: 'Escola Estadual Teste 2 (Padrão)', inep: '87654321' },
  { id: 'school3', name: 'Centro Educacional Modelo 3 (Padrão)', inep: '98765432' },
];

const SCHOOLS_STORAGE_KEY = 'schoolList';

export function SchoolSettingsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof schoolListSchema>>({
    resolver: zodResolver(schoolListSchema),
    defaultValues: {
      schoolsJson: JSON.stringify(defaultSchools, null, 2),
    },
  });

  useEffect(() => {
    try {
        const storedSchools = localStorage.getItem(SCHOOLS_STORAGE_KEY);
        if (storedSchools) {
            form.setValue('schoolsJson', JSON.stringify(JSON.parse(storedSchools), null, 2));
        }
    } catch (error) {
        console.error("Failed to parse schools from localStorage", error);
    }
  }, [form]);

  async function onSubmit(values: z.infer<typeof schoolListSchema>) {
    setLoading(true);
    try {
      // Parse the JSON from the textarea
      let parsedSchools = JSON.parse(values.schoolsJson);
      
      // Auto-generate ID for each school if it doesn't exist, using inep for uniqueness
      const schoolsWithIds: School[] = parsedSchools.map((school: any) => ({
        ...school,
        id: school.id || `school_${school.inep}_${Date.now()}`
      }));
      
      // Save the processed list with IDs to localStorage
      localStorage.setItem(SCHOOLS_STORAGE_KEY, JSON.stringify(schoolsWithIds));
      
      // Update the form to show the newly formatted JSON with IDs
      form.setValue('schoolsJson', JSON.stringify(schoolsWithIds, null, 2));

      toast({
        title: "Sucesso!",
        description: "Lista de escolas salva com sucesso. Os IDs foram gerados automaticamente.",
      });
    } catch (error) {
      toast({
        title: "Erro!",
        description: "Não foi possível salvar a lista de escolas. Verifique o formato do JSON.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Escolas</CardTitle>
        <CardDescription>
          Adicione ou atualize a lista de escolas disponíveis para o censo. Cole o conteúdo em formato JSON.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="schoolsJson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lista de Escolas (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={15}
                      placeholder='[{"name": "Nome da Escola", "inep": "12345678"}]'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    O JSON deve ser um array de objetos. Cada objeto precisa ter "name" e "inep". O campo "id" será gerado automaticamente se não for fornecido.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Lista de Escolas
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
