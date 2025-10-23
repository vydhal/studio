
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
import type { Professional } from "@/types";
import { db } from "@/lib/firebase";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";

const professionalListSchema = z.object({
  professionalsJson: z.string().refine((val) => {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) && parsed.every(item => 
        typeof item === 'object' && 'name' in item && typeof item.name === 'string'
      );
    } catch (e) {
      return false;
    }
  }, {
    message: "O JSON fornecido é inválido. Verifique se é um array de objetos, onde cada objeto deve conter a chave 'name'.",
  }),
});

export function ProfessionalsSettingsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const form = useForm<z.infer<typeof professionalListSchema>>({
    resolver: zodResolver(professionalListSchema),
    defaultValues: {
      professionalsJson: "[]",
    },
  });

  useEffect(() => {
    if (!db) return;
    setFetching(true);
    const fetchProfessionals = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'professionals'));
        const professionalsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Professional[];
        form.setValue('professionalsJson', JSON.stringify(professionalsData, null, 2));
      } catch (error) {
        console.error("Failed to fetch professionals from Firestore", error);
        toast({ title: "Erro ao carregar profissionais", variant: "destructive" });
      } finally {
        setFetching(false);
      }
    };
    fetchProfessionals();
  }, [form, toast]);

  async function onSubmit(values: z.infer<typeof professionalListSchema>) {
    if (!db) {
      toast({ title: "Erro de Conexão", description: "Banco de dados não disponível.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const parsedProfessionals = JSON.parse(values.professionalsJson);
      
      const batch = writeBatch(db);
      const professionalsWithIds: Professional[] = [];

      for (const prof of parsedProfessionals) {
        const profRef = prof.id ? doc(db, 'professionals', prof.id) : doc(collection(db, 'professionals'));
        const profData = { id: profRef.id, name: prof.name };
        batch.set(profRef, { name: prof.name }); // Save only name
        professionalsWithIds.push(profData);
      }
      
      await batch.commit();
      
      form.setValue('professionalsJson', JSON.stringify(professionalsWithIds, null, 2));

      toast({
        title: "Sucesso!",
        description: `Lista de profissionais salva com sucesso. Foram processados ${professionalsWithIds.length} profissionais.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro!",
        description: error.message || "Não foi possível salvar a lista de profissionais. Verifique o formato do JSON.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Profissionais</CardTitle>
        <CardDescription>
          Adicione ou atualize a lista de profissionais (professores, etc.). Cole o conteúdo em formato JSON.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            {fetching ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> :
              <FormField
                control={form.control}
                name="professionalsJson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lista de Profissionais (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={15}
                        placeholder='[{"name": "João da Silva"}, {"name": "Maria Oliveira"}]'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Cole um array de objetos JSON. O campo "name" é obrigatório.
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
              Salvar Lista de Profissionais
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
