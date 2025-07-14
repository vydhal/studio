
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
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

const schoolListSchema = z.object({
  schoolsJson: z.string().refine((val) => {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) && parsed.every(item => 'name' in item && 'inep' in item);
    } catch (e) {
      return false;
    }
  }, {
    message: "O JSON fornecido é inválido ou não segue o formato esperado: [{ \"name\": \"...\", \"inep\": \"...\" }]",
  }),
});

const defaultJson = JSON.stringify([
  {
    "name": "Escola Municipal João Silva",
    "inep": "23456789"
  },
  {
    "name": "Escola Estadual Maria Santos",
    "inep": "34567890"
  }
], null, 2);

export function SchoolSettingsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof schoolListSchema>>({
    resolver: zodResolver(schoolListSchema),
    defaultValues: {
      schoolsJson: defaultJson,
    },
  });

  async function onSubmit(values: z.infer<typeof schoolListSchema>) {
    setLoading(true);
    // In a real app, you would parse and save this to Firestore
    console.log("Saving schools JSON:", JSON.parse(values.schoolsJson));
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Sucesso!",
      description: "Lista de escolas salva com sucesso (simulação).",
    });
    setLoading(false);
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
                      placeholder="Cole o JSON aqui..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    O JSON deve ser um array de objetos, cada um com as chaves "name" e "inep".
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
