
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
import { db } from "@/lib/firebase";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";

const schoolListSchema = z.object({
  schoolsJson: z.string().refine((val) => {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) && parsed.every(item => 
        typeof item === 'object' && 
        ('inep' in item || 'INEP' in item) && 
        ('name' in item || 'UNIDADE EDUCACIONAL' in item)
      );
    } catch (e) {
      return false;
    }
  }, {
    message: "O JSON fornecido é inválido. Verifique se é um array de objetos, onde cada objeto deve conter as chaves 'inep' (ou 'INEP') e 'name' (ou 'UNIDADE EDUCACIONAL').",
  }),
});

export function SchoolSettingsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const form = useForm<z.infer<typeof schoolListSchema>>({
    resolver: zodResolver(schoolListSchema),
    defaultValues: {
      schoolsJson: "[]",
    },
  });

  useEffect(() => {
    if (!db) return;
    setFetching(true);
    const fetchSchools = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'schools'));
        const schoolsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as School[];
        form.setValue('schoolsJson', JSON.stringify(schoolsData, null, 2));
      } catch (error) {
        console.error("Failed to fetch schools from Firestore", error);
        toast({ title: "Erro ao carregar escolas", variant: "destructive" });
      } finally {
        setFetching(false);
      }
    };
    fetchSchools();
  }, [form, toast]);

  async function onSubmit(values: z.infer<typeof schoolListSchema>) {
    if (!db) {
      toast({ title: "Erro de Conexão", description: "Banco de dados não disponível.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      let parsedSchools = JSON.parse(values.schoolsJson);
      
      const batch = writeBatch(db);

      const schoolsWithIds: School[] = parsedSchools.map((school: any, index: number) => {
        const schoolName = school.name || school['UNIDADE EDUCACIONAL'];
        const schoolInep = school.inep || school['INEP'];

        if (!schoolName || !schoolInep) {
            throw new Error(`Objeto de escola inválido encontrado no índice ${index}.`);
        }

        // Use INEP as a stable, unique ID
        const schoolId = String(schoolInep);
        const schoolRef = doc(db, 'schools', schoolId);

        const schoolData = {
          name: schoolName,
          inep: String(schoolInep),
        };
        batch.set(schoolRef, schoolData);
        
        return {
          id: schoolId,
          name: schoolName,
          inep: String(schoolInep),
        };
      });
      
      await batch.commit();
      
      form.setValue('schoolsJson', JSON.stringify(schoolsWithIds, null, 2));

      toast({
        title: "Sucesso!",
        description: `Lista de escolas salva com sucesso. Foram processadas ${schoolsWithIds.length} escolas.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro!",
        description: error.message || "Não foi possível salvar a lista de escolas. Verifique o formato do JSON.",
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
          Adicione ou atualize a lista de escolas disponíveis para o censo. Cole o conteúdo em formato JSON. O INEP será usado como ID único.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            {fetching ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> :
              <FormField
                control={form.control}
                name="schoolsJson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lista de Escolas (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={15}
                        placeholder='[{"UNIDADE EDUCACIONAL": "Nome da Escola", "INEP": "12345678"}]'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Cole um array de objetos JSON. O campo INEP é obrigatório e será usado como o ID.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            }
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading || fetching}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Lista de Escolas
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
