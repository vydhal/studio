
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppSettings } from '@/context/AppContext';
import { Facebook, Instagram, Twitter, ArrowRight, BookOpenCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { DotLottiePlayer } from '@dotlottie/react-player';


export function HomeContent() {
    const { settings, loading } = useAppSettings();

    if (loading || !settings) {
        return <HomeSkeleton />;
    }

    return (

        <div className="container py-12 md:py-24">
            <div className="flex flex-col items-center justify-center gap-12 text-center">
                <div className="flex flex-col justify-center space-y-6 max-w-3xl items-center">
                    <div className="space-y-4">
                        {settings.logoUrl && (
                            <Image
                                data-ai-hint="logo"
                                src={settings.logoUrl}
                                alt="Logo"
                                width={140}
                                height={140}
                                className="rounded-lg mb-6 mx-auto"
                            />
                        )}
                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                            {settings.title}
                        </h1>
                        <p className="max-w-[700px] text-muted-foreground text-lg md:text-xl mx-auto">
                            {settings.subtitle}
                        </p>
                    </div>
                    <p className="max-w-[700px] text-muted-foreground mx-auto">
                        {settings.description}
                    </p>
                    <div className="flex flex-col gap-3 min-[400px]:flex-row justify-center w-full">
                        <Button size="lg" asChild className="w-full sm:w-auto px-8">
                            <Link href="/census">
                                Preencher Censo
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild className="w-full sm:w-auto px-8">
                            <Link href="/login">
                                Painel do Admin
                            </Link>
                        </Button>
                    </div>
                    {(settings.facebookUrl || settings.instagramUrl || settings.twitterUrl) &&
                        <div className="flex gap-6 mt-8 justify-center">
                            {settings.instagramUrl && <Link href={settings.instagramUrl} target="_blank"><Instagram className="h-7 w-7 text-muted-foreground hover:text-primary transition-colors" /></Link>}
                            {settings.twitterUrl && <Link href={settings.twitterUrl} target="_blank"><Twitter className="h-7 w-7 text-muted-foreground hover:text-primary transition-colors" /></Link>}
                            {settings.facebookUrl && <Link href={settings.facebookUrl} target="_blank"><Facebook className="h-7 w-7 text-muted-foreground hover:text-primary transition-colors" /></Link>}
                        </div>
                    }
                </div>

                <div className="w-full max-w-[500px] aspect-square flex items-center justify-center -mt-8">
                    <DotLottiePlayer
                        src="https://lottie.host/57e7f780-e792-4161-8d26-258079f53096/2p6k6X6t1T.json"
                        loop
                        autoplay
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
            </div>
            <div className="mt-16">
                <h2 className="text-2xl font-bold text-center mb-8 font-headline">Funcionalidades Principais</h2>
                <div className="grid gap-8 md:grid-cols-3">
                    <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-col items-center gap-4 text-center">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <BookOpenCheck className="w-8 h-8 text-primary" />
                            </div>
                            <CardTitle>Coleta de Dados Simplificada</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-muted-foreground">
                            <p>Um formulário intuitivo e dinâmico para o censo escolar, facilitando o preenchimento.</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-col items-center gap-4 text-center">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-primary"><path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20V16" /></svg>
                            </div>
                            <CardTitle>Dashboard Analítico</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-muted-foreground">
                            <p>Visualize métricas e gráficos gerados em tempo real a partir dos dados coletados.</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-col items-center gap-4 text-center">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            </div>
                            <CardTitle>Gerenciamento Seguro</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-muted-foreground">
                            <p>Autenticação e armazenamento de dados seguros com a robustez do Google Firebase.</p>
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
            <div className="flex flex-col items-center justify-center gap-12">
                <div className="flex flex-col justify-center space-y-4 max-w-2xl items-center w-full">
                    <div className="space-y-2 flex flex-col items-center w-full">
                        <Skeleton className="h-[120px] w-[120px] rounded-lg mb-6" />
                        <div className="w-full max-w-2xl flex justify-center">
                            <Skeleton className="h-12 w-3/4" />
                        </div>
                        <div className="w-full max-w-lg flex justify-center">
                            <Skeleton className="h-8 w-full" />
                        </div>
                    </div>
                    <div className="w-full max-w-lg flex justify-center">
                        <Skeleton className="h-6 w-full" />
                    </div>
                    <div className="flex gap-4 min-[400px]:flex-row justify-center w-full mt-4">
                        <Skeleton className="h-12 w-40" />
                        <Skeleton className="h-12 w-40" />
                    </div>
                    <div className="flex gap-4 mt-6">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                </div>
                <Skeleton className="w-full max-w-[500px] aspect-square rounded-xl" />
            </div>
        </div>
    );
}
