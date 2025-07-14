
"use client";

import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  logoUrl: z.string().url("URL inválida.").or(z.literal("")).optional(),
  title: z.string().min(1, "Título é obrigatório."),
  subtitle: z.string().min(1, "Subtítulo é obrigatório."),
  description: z.string().min(1, "Descrição é obrigatória."),
  facebookUrl: z.string().url("URL inválida.").or(z.literal("")).optional(),
  instagramUrl: z.string().url("URL inválida.").or(z.literal("")).optional(),
  twitterUrl: z.string().url("URL inválida.").or(z.literal("")).optional(),
});

const defaultSettings = {
    logoUrl: "",
    title: "Bem-vindo ao Firebase School Central (Exemplo)",
    subtitle: "Sua plataforma completa para gerenciamento de censo escolar.",
    description: "Este é um exemplo de texto carregado localmente.",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
};


export function SettingsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultSettings,
  });

  useEffect(() => {
    // Simulate fetching settings
    setFetching(true);
    setTimeout(() => {
        // In a real app, you would fetch from Firestore here.
        // For testing, we just use the default mock data.
        form.reset(defaultSettings);
        setFetching(false);
    }, 500);
  }, [form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    // Simulate saving to Firestore
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Mock settings saved:", values);
    toast({
        title: "Sucesso!",
        description: "Configurações da página inicial salvas (simulação).",
    });
    setLoading(false);
  }

  if (fetching) {
    return (
        <Card>
            <CardHeader><CardTitle>Configurações da Página Inicial</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-24" />
            </CardFooter>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações da Página Inicial</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Título Principal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="subtitle" render={({ field }) => (
                <FormItem><FormLabel>Subtítulo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="logoUrl" render={({ field }) => (
                <FormItem><FormLabel>URL do Logo</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="instagramUrl" render={({ field }) => (
                <FormItem><FormLabel>URL do Instagram</FormLabel><FormControl><Input placeholder="https://instagram.com/..." {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="twitterUrl" render={({ field }) => (
                <FormItem><FormLabel>URL do Twitter/X</FormLabel><FormControl><Input placeholder="https://x.com/..." {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="facebookUrl" render={({ field }) => (
                <FormItem><FormLabel>URL do Facebook</FormLabel><FormControl><Input placeholder="https://facebook.com/..." {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
