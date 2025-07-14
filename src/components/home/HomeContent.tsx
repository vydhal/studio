
"use client";

import { useEffect, useState } from 'react';
import type { HomeSettings } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Facebook, Instagram, Twitter, ArrowRight, BookOpenCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const defaultSettings: HomeSettings = {
    title: 'Bem-vindo ao Firebase School Central',
    subtitle: 'Sua plataforma completa para gerenciamento de censo escolar.',
    description: 'Nossa plataforma simplifica a coleta e análise de dados do censo escolar, fornecendo insights valiosos para gestores e administradores. Preencha o formulário ou acesse o painel administrativo para começar.',
    logoUrl: 'https://placehold.co/100x100.png',
    facebookUrl: '#',
    instagramUrl: '#',
    twitterUrl: '#',
};

const SETTINGS_STORAGE_KEY = 'homePageSettings';

export function HomeContent() {
    const [settings, setSettings] = useState<HomeSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        try {
            const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (storedSettings) {
                setSettings(JSON.parse(storedSettings));
            } else {
                setSettings(defaultSettings);
            }
        } catch (error) {
            console.error("Failed to parse settings from localStorage", error);
            setSettings(defaultSettings);
        }
        setLoading(false);
    }, []);

    if (loading || !settings) {
        return <HomeSkeleton />;
    }

    return (
        <div className="container py-12 md:py-24">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-[1fr_550px]">
                <div className="flex flex-col justify-center space-y-4">
                    <div className="space-y-2">
                        {settings.logoUrl && (
                          <Image
                            data-ai-hint="logo"
                            src={settings.logoUrl}
                            alt="Logo"
                            width={100}
                            height={100}
                            className="rounded-lg mb-4"
                          />
                        )}
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                            {settings.title}
                        </h1>
                        <p className="max-w-[600px] text-muted-foreground md:text-xl">
                            {settings.subtitle}
                        </p>
                    </div>
                    <p className="max-w-[600px] text-muted-foreground">
                        {settings.description}
                    </p>
                    <div className="flex flex-col gap-2 min-[400px]:flex-row">
                        <Button size="lg" asChild>
                           <Link href="/census">
                                Preencher Censo
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/login">
                                Painel do Admin
                            </Link>
                        </Button>
                    </div>
                     { (settings.facebookUrl || settings.instagramUrl || settings.twitterUrl) &&
                        <div className="flex gap-4 mt-4">
                            {settings.instagramUrl && <Link href={settings.instagramUrl} target="_blank"><Instagram className="h-6 w-6 text-muted-foreground hover:text-primary" /></Link>}
                            {settings.twitterUrl && <Link href={settings.twitterUrl} target="_blank"><Twitter className="h-6 w-6 text-muted-foreground hover:text-primary" /></Link>}
                            {settings.facebookUrl && <Link href={settings.facebookUrl} target="_blank"><Facebook className="h-6 w-6 text-muted-foreground hover:text-primary" /></Link>}
                        </div>
                    }
                </div>
                <Image
                    data-ai-hint="school students"
                    src="https://placehold.co/600x400.png"
                    alt="Hero Image"
                    width={600}
                    height={400}
                    className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                />
            </div>
             <div className="mt-16">
                <h2 className="text-2xl font-bold text-center mb-8 font-headline">Funcionalidades Principais</h2>
                <div className="grid gap-8 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <BookOpenCheck className="w-8 h-8 text-accent"/>
                            <CardTitle>Coleta de Dados Simplificada</CardTitle>
                        </CardHeader>
                        <CardContent>
                            Um formulário intuitivo e dinâmico para o censo escolar, facilitando o preenchimento.
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-accent"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20V16"/></svg>
                            <CardTitle>Dashboard Analítico</CardTitle>
                        </CardHeader>
                        <CardContent>
                            Visualize métricas e gráficos gerados em tempo real a partir dos dados coletados.
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-accent"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            <CardTitle>Gerenciamento Seguro</CardTitle>
                        </CardHeader>
                        <CardContent>
                           Autenticação e armazenamento de dados seguros com a robustez do Google Firebase.
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function HomeSkeleton() {
    return (
        <div className="container py-12 md:py-24">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-[1fr_550px]">
                <div className="flex flex-col justify-center space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-[100px] w-[100px] rounded-lg mb-4" />
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                            <Skeleton className="h-12 w-full max-w-2xl" />
                        </h1>
                        <div className="max-w-[600px] text-muted-foreground md:text-xl">
                            <Skeleton className="h-8 w-full max-w-lg" />
                        </div>
                    </div>
                     <div className="max-w-[600px] text-muted-foreground">
                        <Skeleton className="h-6 w-full max-w-xl" />
                     </div>
                    <div className="flex flex-col gap-2 min-[400px]:flex-row">
                        <Skeleton className="h-12 w-40" />
                        <Skeleton className="h-12 w-40" />
                    </div>
                    <div className="flex gap-4 mt-4">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                </div>
                <Skeleton className="w-full h-[400px] rounded-xl aspect-video" />
            </div>
             <div className="mt-16">
                <h2 className="text-2xl font-bold text-center mb-8 font-headline"><Skeleton className="h-8 w-1/2 mx-auto" /></h2>
                <div className="grid gap-8 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Skeleton className="w-8 h-8" />
                            <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
                        </CardHeader>
                        <CardContent>
                           <Skeleton className="h-5 w-full" />
                           <Skeleton className="h-5 w-2/3 mt-2" />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Skeleton className="w-8 h-8" />
                            <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
                        </CardHeader>
                        <CardContent>
                           <Skeleton className="h-5 w-full" />
                           <Skeleton className="h-5 w-2/3 mt-2" />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Skeleton className="w-8 h-8" />
                            <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
                        </CardHeader>
                        <CardContent>
                           <Skeleton className="h-5 w-full" />
                           <Skeleton className="h-5 w-2/3 mt-2" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
