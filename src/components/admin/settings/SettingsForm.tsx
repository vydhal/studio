
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
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { HomeSettings } from "@/types";
import { useAppSettings } from "@/context/AppContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";


const formSchema = z.object({
  appName: z.string().min(1, "Nome da aplicação é obrigatório."),
  logoUrl: z.string().url("URL inválida.").or(z.literal("")).optional(),
  title: z.string().min(1, "Título é obrigatório."),
  subtitle: z.string().min(1, "Subtítulo é obrigatório."),
  description: z.string().min(1, "Descrição é obrigatória."),
  footerText: z.string().min(1, "Texto do rodapé é obrigatório."),
  facebookUrl: z.string().url("URL inválida.").or(z.literal("")).optional(),
  instagramUrl: z.string().url("URL inválida.").or(z.literal("")).optional(),
  twitterUrl: z.string().url("URL inválida.").or(z.literal("")).optional(),
  primaryColor: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Cor inválida.").or(z.literal("")).optional(),
});


export function HomePageSettingsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { settings: currentSettings, loading: fetching } = useAppSettings();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      appName: "",
      logoUrl: "",
      title: "",
      subtitle: "",
      description: "",
      footerText: "",
      facebookUrl: "",
      instagramUrl: "",
      instagramUrl: "",
      twitterUrl: "",
      primaryColor: "#000000",
    },
  });

  useEffect(() => {
    if (currentSettings) {
      form.reset({
        ...currentSettings,
        logoUrl: currentSettings.logoUrl || "",
        facebookUrl: currentSettings.facebookUrl || "",
        instagramUrl: currentSettings.instagramUrl || "",
        twitterUrl: currentSettings.twitterUrl || "",
        primaryColor: currentSettings.primaryColor || "#000000",
      });
    }
  }, [currentSettings, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!db) {
      toast({ title: "Erro de Conexão", description: "Banco de dados não disponível.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const settingsRef = doc(db, 'settings', 'homePage');
      await setDoc(settingsRef, values);

      toast({
        title: "Sucesso!",
        description: "Configurações da página inicial salvas com sucesso.",
      });
      // Forçar recarregamento da página para que as mudanças no tema (cores, nome) sejam aplicadas
      window.location.reload();
    } catch (error) {
      toast({
        title: "Erro!",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
      console.error("Failed to save settings to Firestore", error);
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Página Inicial</CardTitle>
          <CardDescription>Personalize o conteúdo da página inicial para os visitantes.</CardDescription>
        </CardHeader>
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
        <CardTitle>Página Inicial</CardTitle>
        <CardDescription>Personalize o conteúdo e a aparência da aplicação.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="appName" render={({ field }) => (
              <FormItem><FormLabel>Nome da Aplicação</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>O nome que aparece no cabeçalho e título da página.</FormDescription><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="logoUrl" render={({ field }) => (
              <FormItem><FormLabel>URL do Logo</FormLabel><FormControl><Input placeholder="https://..." {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Título Principal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="subtitle" render={({ field }) => (
              <FormItem><FormLabel>Subtítulo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="primaryColor" render={({ field }) => (
              <FormItem>
                <FormLabel>Cor Primária (Marca)</FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input type="color" className="w-12 h-10 p-1 cursor-pointer" {...field} />
                  </FormControl>
                  <Input {...field} placeholder="#000000" className="w-32" />
                </div>
                <FormDescription>Escolha a cor principal da sua marca.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="footerText" render={({ field }) => (
              <FormItem><FormLabel>Texto do Rodapé</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="instagramUrl" render={({ field }) => (
              <FormItem><FormLabel>URL do Instagram</FormLabel><FormControl><Input placeholder="https://instagram.com/..." {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="twitterUrl" render={({ field }) => (
              <FormItem><FormLabel>URL do Twitter/X</FormLabel><FormControl><Input placeholder="https://x.com/..." {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="facebookUrl" render={({ field }) => (
              <FormItem><FormLabel>URL do Facebook</FormLabel><FormControl><Input placeholder="https://facebook.com/..." {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
            )} />
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
