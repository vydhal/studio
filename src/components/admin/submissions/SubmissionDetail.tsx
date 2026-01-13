
"use client";

import { useState, useEffect } from "react";
import type { SchoolCensusSubmission, School, Classroom, FormSectionConfig } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Users, Tv, Wind, Zap, Armchair, Wifi, Snowflake, Bot, Laptop, Printer, Router, AlertTriangle, Loader2, Download, UserCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/firebase";
import { doc, getDoc, onSnapshot, Timestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

interface SubmissionDetailProps {
    schoolId: string;
}

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number | React.ReactNode }) => (
    <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-md">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-semibold">{value || 'N/A'}</p>
        </div>
    </div>
)

const ClassroomDetails = ({ classroom }: { classroom: Classroom }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <InfoItem icon={Users} label="Capacidade" value={classroom.studentCapacity} />
        <InfoItem icon={Armchair} label="Cadeiras" value={classroom.chairCount} />
        <InfoItem icon={Zap} label="Tomadas" value={classroom.outlets} />
        <InfoItem icon={Tv} label="TVs" value={classroom.tvCount} />
        <InfoItem icon={Wind} label="Ventiladores" value={classroom.fanCount} />
        <InfoItem icon={Users} label="Série Manhã" value={classroom.gradeMorning} />
        <InfoItem icon={Users} label="Série Tarde" value={classroom.gradeAfternoon} />
        <InfoItem icon={Users} label="Projeção Manhã 2026" value={classroom.gradeProjection2026Morning} />
        <InfoItem icon={Users} label="Projeção Tarde 2026" value={classroom.gradeProjection2026Afternoon} />

        <div className="flex items-center gap-2">
            {classroom.hasInternet ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-destructive" />}
            <span className="flex items-center gap-1"><Wifi className="h-4 w-4 text-muted-foreground" /> Internet</span>
        </div>
        <div className="flex items-center gap-2">
            {classroom.hasAirConditioning ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-destructive" />}
            <span className="flex items-center gap-1"><Snowflake className="h-4 w-4 text-muted-foreground" /> Ar Cond.</span>
        </div>
    </div>
)

const techIcons: { [key: string]: React.ElementType } = {
    'Kits de Robótica': Bot,
    'Chromebooks': Laptop,
    'Notebooks': Laptop,
    'Modems': Router,
    'Impressoras': Printer,
    'Modems com Defeito': Router,
};


export function SubmissionDetail({ schoolId }: SubmissionDetailProps) {
    const [submission, setSubmission] = useState<SchoolCensusSubmission | null>(null);
    const [school, setSchool] = useState<School | null>(null);
    const [formConfig, setFormConfig] = useState<FormSectionConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        if (authLoading || !user || !db) {
            if (!authLoading) setLoading(false);
            return;
        }

        let unsubscribes: (() => void)[] = [];
        setLoading(true);

        const fetchData = async () => {
            try {
                const schoolDocRef = doc(db, 'schools', schoolId);
                const formConfigDocRef = doc(db, 'settings', 'formConfig');

                const [schoolDoc, formConfigDoc] = await Promise.all([
                    getDoc(schoolDocRef),
                    getDoc(formConfigDocRef)
                ]);

                if (schoolDoc.exists()) {
                    setSchool({ id: schoolDoc.id, ...schoolDoc.data() } as School);
                } else {
                    console.warn("School not found");
                }

                if (formConfigDoc.exists()) {
                    setFormConfig(formConfigDoc.data().sections || []);
                } else {
                    console.warn("Form config not found");
                }

                const submissionDocRef = doc(db, 'submissions', schoolId);
                const submissionUnsubscribe = onSnapshot(submissionDocRef, (doc) => {
                    if (doc.exists()) {
                        const data = doc.data();
                        const submissionData = {
                            ...data,
                            id: doc.id,
                            submittedAt: data.submittedAt instanceof Timestamp ? data.submittedAt.toDate() : new Date(),
                        } as SchoolCensusSubmission;
                        setSubmission(submissionData);
                    } else {
                        setSubmission(null);
                    }
                }, (error) => {
                    console.error("Error listening to submission details:", error);
                });
                unsubscribes.push(submissionUnsubscribe);

            } catch (error) {
                console.error("Failed to load data from Firestore", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };

    }, [schoolId, user, authLoading]);

    const handleDownloadCSV = () => {
        if (!submission || !school) return;

        const flattenObject = (obj: any, prefix = ''): { [key: string]: any } => {
            return Object.keys(obj).reduce((acc: any, k: string) => {
                const pre = prefix.length ? prefix + '_' : '';
                if (typeof obj[k] === 'object' && obj[k] !== null && !(obj[k] instanceof Date) && !Array.isArray(obj[k])) {
                    Object.assign(acc, flattenObject(obj[k], pre + k));
                } else {
                    acc[pre + k] = obj[k];
                }
                return acc;
            }, {});
        };

        const data: { [key: string]: any } = {
            'escola_nome': school.name,
            'escola_inep': school.inep,
            'data_submissao': submission.submittedAt ? format(new Date(submission.submittedAt), "dd/MM/yyyy HH:mm:ss") : 'Em andamento',
        };

        // Flatten dynamic data
        if (submission.dynamicData) {
            Object.keys(submission.dynamicData).forEach(sectionKey => {
                const section = submission.dynamicData[sectionKey];
                if (section) {
                    Object.keys(section).forEach(fieldKey => {
                        data[`${sectionKey}_${fieldKey}`] = section[fieldKey];
                    });
                }
            });
        }

        // Flatten Classrooms
        if (submission.infrastructure?.classrooms) {
            submission.infrastructure.classrooms.forEach((classroom, index) => {
                const prefix = `sala_${index + 1}`;
                data[`${prefix}_nome`] = classroom.name;
                data[`${prefix}_capacidade`] = classroom.studentCapacity;
                data[`${prefix}_cadeiras`] = classroom.chairCount;
                data[`${prefix}_tomadas`] = classroom.outlets;
                data[`${prefix}_tvs`] = classroom.tvCount;
                data[`${prefix}_ventiladores`] = classroom.fanCount;
                data[`${prefix}_internet`] = classroom.hasInternet ? 'Sim' : 'Não';
                data[`${prefix}_ar_condicionado`] = classroom.hasAirConditioning ? 'Sim' : 'Não';
                data[`${prefix}_serie_manha`] = classroom.gradeMorning;
                data[`${prefix}_serie_tarde`] = classroom.gradeAfternoon;
            });
        }

        // Flatten Management
        if (submission.management?.members) {
            submission.management.members.forEach((member, index) => {
                const prefix = `gestao_membro_${index + 1}`;
                data[`${prefix}_nome`] = member.name;
                data[`${prefix}_cargo`] = member.role;
                data[`${prefix}_telefone`] = member.phone;
                data[`${prefix}_email`] = member.email;
            });
        }

        // Flatten Inventory
        if (submission.inventory) {
            Object.keys(submission.inventory).forEach(categoryKey => {
                // @ts-ignore
                const items = submission.inventory[categoryKey];
                if (Array.isArray(items)) {
                    items.forEach((item: any, index: number) => {
                        const prefix = `inventario_${categoryKey}_${index + 1}`;
                        data[`${prefix}_descricao`] = item.description;
                        data[`${prefix}_quantidade`] = item.quantity;
                        data[`${prefix}_origem`] = item.origin;
                        data[`${prefix}_obs`] = item.observation;
                    });
                }
            });
        }

        // Create CSV Content
        const headers = Object.keys(data);
        const values = Object.values(data).map(val => {
            const stringVal = String(val === undefined || val === null ? '' : val);
            return `"${stringVal.replace(/"/g, '""')}"`; // Escape quotes
        });

        const csvContent = [
            headers.join(','),
            values.join(',')
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `censo_${school.name.replace(/\s+/g, '_').toLowerCase()}_${format(new Date(), "yyyyMMdd")}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    if (loading || authLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        )
    }

    if (!school) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle />
                        Escola não encontrada
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Não foi encontrada nenhuma escola com o ID solicitado.</p>
                    <Button asChild variant="link" className="px-0">
                        <Link href="/admin/dashboard">Voltar para o Dashboard</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (!submission) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="text-yellow-500" />
                        Submissão não iniciada
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p>A escola <span className="font-semibold">{school.name}</span> ainda não iniciou o preenchimento do censo.</p>
                    <Button asChild variant="link" className="px-0">
                        <Link href="/admin/dashboard">Voltar para o Dashboard</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <Button variant="outline" asChild className="mb-2">
                        <Link href="/admin/dashboard">← Voltar</Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Detalhes da Submissão</h1>
                </div>
                <Button onClick={handleDownloadCSV} disabled={!submission}>
                    <Download className="mr-2 h-4 w-4" />
                    Baixar CSV
                </Button>
            </div>

            {submission.submittedAt ? (
                <p className="text-muted-foreground">
                    Última atualização em: {format(new Date(submission.submittedAt), "dd 'de' MMMM 'de' yyyy, 'às' HH:mm", { locale: ptBR })}
                </p>
            ) : (
                <p className="text-muted-foreground">Censo em andamento. Nenhuma seção foi salva ainda.</p>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Identificação da Escola</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold">Nome da Escola</h3>
                            <p>{school?.name || 'Não informado'}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">Código INEP</h3>
                            <p>{school?.inep || 'Não informado'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Accordion type="multiple" className="w-full space-y-4" defaultValue={['general', 'infra', 'management', 'inventory']}>
                {formConfig.map(sectionConfig => {
                    const sectionData = submission.dynamicData?.[sectionConfig.id];

                    if (sectionConfig.id.startsWith('infra')) {
                        const classrooms = submission.infrastructure?.classrooms || [];
                        return (
                            <AccordionItem value={sectionConfig.id} key={sectionConfig.id} className="border-b-0">
                                <Card>
                                    <AccordionTrigger className="p-6">
                                        <CardTitle>{sectionConfig.name}</CardTitle>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 space-y-4">
                                        {classrooms.length > 0 ? (
                                            classrooms.map((classroom, index) => (
                                                <Accordion key={index} type="single" collapsible className="w-full">
                                                    <AccordionItem value={`item-${index}`} className="border rounded-md px-4">
                                                        <AccordionTrigger className="py-4 text-base font-medium">{classroom.name || `Sala ${index + 1}`}</AccordionTrigger>
                                                        <AccordionContent>
                                                            <ClassroomDetails classroom={classroom} />
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                </Accordion>
                                            ))
                                        ) : (
                                            <Alert variant="default">
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertTitle>Nenhuma sala de aula cadastrada</AlertTitle>
                                            </Alert>
                                        )}
                                    </AccordionContent>
                                </Card>
                            </AccordionItem>
                        );
                    }

                    if (sectionConfig.id === 'management') {
                        const members = submission.management?.members || [];
                        return (
                            <AccordionItem value={sectionConfig.id} key={sectionConfig.id} className="border-b-0">
                                <Card>
                                    <AccordionTrigger className="p-6">
                                        <CardTitle>{sectionConfig.name}</CardTitle>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 space-y-4">
                                        {members.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {members.map((member, index) => (
                                                    <Card key={index} className="bg-muted/50">
                                                        <CardContent className="p-4 space-y-2">
                                                            <div className="flex items-center gap-2 font-semibold">
                                                                <UserCircle className="h-5 w-5" />
                                                                {member.name}
                                                            </div>
                                                            <div className="text-sm space-y-1">
                                                                <p><span className="text-muted-foreground">Cargo:</span> {member.role}</p>
                                                                <p><span className="text-muted-foreground">Telefone:</span> {member.phone || '-'}</p>
                                                                <p><span className="text-muted-foreground">Email:</span> {member.email || '-'}</p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <Alert variant="default">
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertTitle>Nenhuma equipe gestora cadastrada</AlertTitle>
                                                <AlertDescription>Esta seção ainda não foi preenchida.</AlertDescription>
                                            </Alert>
                                        )}
                                    </AccordionContent>
                                </Card>
                            </AccordionItem>
                        );
                    }

                    if (sectionConfig.id === 'inventory') {
                        const inventory = submission.inventory || {};
                        const inventoryCategories = [
                            { key: 'permanent_tech', label: 'Material Permanente e Recursos Tecnológicos' },
                            { key: 'audio_visual', label: 'Recursos Áudio Visuais' },
                            { key: 'connected_edu', label: 'Educação Conectada' },
                            { key: 'pedagogical_games', label: 'Instrumentos Musicais e Jogos Pedagógicos' },
                            { key: 'pedagogical_aee', label: 'Recursos Pedagógicos - AEE' },
                            { key: 'physical_edu', label: 'Materiais para Educação Física' },
                            { key: 'office_supplies', label: 'Materiais de Expediente e Papelaria' },
                            { key: 'hygiene_cleaning', label: 'Materiais de Higiene e Limpeza' },
                            { key: 'warehouse', label: 'Materiais de Copa e Cozinha (Almoxarifado)' },
                            { key: 'library', label: 'Acervo Bibliográfico (Biblioteca)' },
                        ];

                        const hasInventoryItems = inventoryCategories.some(cat =>
                            // @ts-ignore
                            inventory[cat.key] && inventory[cat.key].length > 0
                        );

                        return (
                            <AccordionItem value={sectionConfig.id} key={sectionConfig.id} className="border-b-0">
                                <Card>
                                    <AccordionTrigger className="p-6">
                                        <CardTitle>{sectionConfig.name}</CardTitle>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 space-y-4">
                                        {hasInventoryItems ? (
                                            <Accordion type="multiple" className="w-full">
                                                {inventoryCategories.map((cat) => {
                                                    // @ts-ignore
                                                    const items = inventory[cat.key] || [];
                                                    if (items.length === 0) return null;

                                                    return (
                                                        <AccordionItem value={cat.key} key={cat.key} className="border-b-0">
                                                            <AccordionTrigger className="py-2 hover:no-underline hover:bg-muted/50 px-2 rounded-md">
                                                                <span className="font-semibold text-sm">{cat.label} ({items.length})</span>
                                                            </AccordionTrigger>
                                                            <AccordionContent className="pt-2">
                                                                <div className="grid gap-2">
                                                                    {items.map((item: any, idx: number) => (
                                                                        <div key={idx} className="bg-muted/30 p-3 rounded-md text-sm grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                                                                            <div className="sm:col-span-5 font-medium">{item.description}</div>
                                                                            <div className="sm:col-span-2 text-muted-foreground">Qtd: {item.quantity}</div>
                                                                            <div className="sm:col-span-3 text-muted-foreground">{item.origin}</div>
                                                                            {item.observation && (
                                                                                <div className="sm:col-span-2 text-xs text-muted-foreground italic">Obs: {item.observation}</div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    )
                                                })}
                                            </Accordion>
                                        ) : (
                                            <Alert variant="default">
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertTitle>Nenhum item de inventário cadastrado</AlertTitle>
                                                <AlertDescription>Esta seção ainda não foi preenchida.</AlertDescription>
                                            </Alert>
                                        )}
                                    </AccordionContent>
                                </Card>
                            </AccordionItem>
                        );
                    }

                    return (
                        <AccordionItem value={sectionConfig.id} key={sectionConfig.id} className="border-b-0">
                            <Card>
                                <AccordionTrigger className="p-6">
                                    <CardTitle>{sectionConfig.name}</CardTitle>
                                </AccordionTrigger>
                                <AccordionContent className="px-6">
                                    {!sectionData ? (
                                        <Alert variant="default">
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertTitle>Seção não preenchida</AlertTitle>
                                            <AlertDescription>
                                                Esta seção ainda não foi preenchida.
                                            </AlertDescription>
                                        </Alert>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {sectionConfig.fields.map(fieldConfig => {
                                                const value = sectionData[fieldConfig.id];
                                                let displayValue: React.ReactNode = "Não informado";
                                                if (value !== undefined && value !== null && value !== '') {
                                                    if (typeof value === 'boolean') {
                                                        displayValue = value ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-destructive" />;
                                                    } else if (fieldConfig.type === 'date' && value) {
                                                        displayValue = format(new Date(value), "dd/MM/yyyy");
                                                    }
                                                    else {
                                                        displayValue = String(value);
                                                    }
                                                }
                                                return (
                                                    <div key={fieldConfig.id} className="flex flex-col space-y-1">
                                                        <p className="text-sm font-medium text-muted-foreground">{fieldConfig.name}</p>
                                                        <div className="font-semibold">{displayValue}</div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </AccordionContent>
                            </Card>
                        </AccordionItem>
                    )
                })}
            </Accordion>
        </div>
    );
}
