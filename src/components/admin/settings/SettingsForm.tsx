
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
});

const defaultSettings: HomeSettings = {
    appName: "Firebase School Central",
    logoUrl: "https://placehold.co/100x100.png",
    title: "Bem-vindo ao Firebase School Central (Padrão)",
    subtitle: "Sua plataforma completa para gerenciamento de censo escolar.",
    description: "Nossa plataforma simplifica a coleta e análise de dados do censo escolar, fornecendo insights valiosos para gestores e administradores. Preencha o formulário ou acesse o painel administrativo para começar.",
    footerText: `© ${new Date().getFullYear()} Firebase School Central. Todos os Direitos Reservados.`,
    facebookUrl: "#",
    instagramUrl: "#",
    twitterUrl: "#",
};

const SETTINGS_STORAGE_KEY = 'homePageSettings';

export function HomePageSettingsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

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
      twitterUrl: "",
    },
  });

  useEffect(() => {
    setFetching(true);
    try {
        const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (storedSettings) {
            const settings = JSON.parse(storedSettings);
            // Ensure all fields have a value to prevent uncontrolled -> controlled error
             form.reset({
                ...defaultSettings,
                ...settings,
                logoUrl: settings.logoUrl || "",
                facebookUrl: settings.facebookUrl || "",
                instagramUrl: settings.instagramUrl || "",
                twitterUrl: settings.twitterUrl || "",
            });
        } else {
            form.reset({
                ...defaultSettings,
                logoUrl: defaultSettings.logoUrl || "",
                facebookUrl: defaultSettings.facebookUrl || "",
                instagramUrl: defaultSettings.instagramUrl || "",
                twitterUrl: defaultSettings.twitterUrl || "",
            });
        }
    } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
        form.reset({
            ...defaultSettings,
            logoUrl: defaultSettings.logoUrl || "",
            facebookUrl: defaultSettings.facebookUrl || "",
            instagramUrl: defaultSettings.instagramUrl || "",
            twitterUrl: defaultSettings.twitterUrl || "",
        });
    }
    setFetching(false);
  }, [form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(values));
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
      console.error("Failed to save settings to localStorage", error);
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
            )}/>
            <FormField control={form.control} name="logoUrl" render={({ field }) => (
                <FormItem><FormLabel>URL do Logo</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Título Principal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="subtitle" render={({ field }) => (
                <FormItem><FormLabel>Subtítulo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="footerText" render={({ field }) => (
                <FormItem><FormLabel>Texto do Rodapé</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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
