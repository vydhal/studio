

"use client";

import { useState, useEffect, useCallback } from "react";
import type { SchoolCensusSubmission, School, Classroom, FormSectionConfig, Professional, ClassroomAllocation } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Users, Tv, Wind, Zap, Armchair, Wifi, Snowflake, Bot, Laptop, Printer, Router, AlertTriangle, Loader2, UserCog, HardHat, Clock, MessageSquare, Sun, Moon, Star, Building2, Bath, Palette, Wrench } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/firebase";
import { doc, getDoc, onSnapshot, Timestamp, collection, getDocs } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";


interface SubmissionDetailProps {
  schoolId: string;
}

const InfoItem = ({ icon: Icon, label, value, show = true }: { icon: React.ElementType, label: string, value: string | number | React.ReactNode, show?: boolean }) => {
    if (!show || value === null || value === undefined || value === '' || value === 0) return null;
    return (
        <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-md">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-semibold">{value || 'N/A'}</p>
            </div>
        </div>
    )
}

const ClassroomDetails = ({ classroom }: { classroom: Classroom }) => (
    <div className="space-y-4">
        <div>
             <h4 className="font-semibold text-md mb-2">Geral</h4>
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <InfoItem icon={Users} label="Capacidade" value={classroom.studentCapacity} />
                <div className="flex items-center gap-2">
                    {classroom.isAdapted ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-destructive" />}
                    <span className="flex items-center gap-1"><Building2 className="h-4 w-4 text-muted-foreground" /> Sala Adaptada</span>
                </div>
            </div>
        </div>

       {classroom.occupationType === 'integral' ? (
         <div>
            <h4 className="font-semibold text-md mb-2">Ocupação (Período Integral)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <InfoItem icon={Sun} label="Série Integral" value={classroom.gradeIntegral} show={!!classroom.gradeIntegral} />
                <InfoItem icon={Users} label="Alunos Integral" value={classroom.studentsIntegral} show={!!classroom.studentsIntegral} />
                 <InfoItem icon={Clock} label="Projeção 2026" value={classroom.gradeProjection2026Integral} show={!!classroom.gradeProjection2026Integral} />
            </div>
        </div>
       ) : (
        <>
            <div>
                <h4 className="font-semibold text-md mb-2">Ocupação Atual (Turnos)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6">
                    <InfoItem icon={Sun} label="Série Manhã" value={classroom.gradeMorning} show={!!classroom.gradeMorning} />
                    <InfoItem icon={Users} label="Alunos Manhã" value={classroom.studentsMorning} show={!!classroom.studentsMorning} />
                    <div></div>
                    <InfoItem icon={Sun} label="Série Tarde" value={classroom.gradeAfternoon} show={!!classroom.gradeAfternoon} />
                    <InfoItem icon={Users} label="Alunos Tarde" value={classroom.studentsAfternoon} show={!!classroom.studentsAfternoon} />
                    <div></div>
                    <InfoItem icon={Moon} label="Série Noite" value={classroom.gradeNight} show={!!classroom.gradeNight} />
                    <InfoItem icon={Users} label="Alunos Noite" value={classroom.studentsNight} show={!!classroom.studentsNight} />
                </div>
            </div>
            
             <div>
                <h4 className="font-semibold text-md mb-2">Projeção 2026 (Turnos)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <InfoItem icon={Sun} label="Projeção Manhã" value={classroom.gradeProjection2026Morning} show={!!classroom.gradeProjection2026Morning} />
                    <InfoItem icon={Sun} label="Projeção Tarde" value={classroom.gradeProjection2026Afternoon} show={!!classroom.gradeProjection2026Afternoon} />
                    <InfoItem icon={Moon} label="Projeção Noite" value={classroom.gradeProjection2026Night} show={!!classroom.gradeProjection2026Night} />
                </div>
            </div>
        </>
       )}

        <div>
             <h4 className="font-semibold text-md mb-2">Recursos</h4>
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                    {classroom.hasTv ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-destructive" />}
                    <span className="flex items-center gap-1"><Tv className="h-4 w-4 text-muted-foreground" /> TV</span>
                </div>
                 <div className="flex items-center gap-2">
                    {classroom.hasInternet ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-destructive" />}
                    <span className="flex items-center gap-1"><Wifi className="h-4 w-4 text-muted-foreground" /> Internet</span>
                </div>
                <div className="flex items-center gap-2">
                    {classroom.hasAirConditioning ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-destructive" />}
                    <span className="flex items-center gap-1"><Snowflake className="h-4 w-4 text-muted-foreground" /> Ar Cond.</span>
                </div>
                 <div className="flex items-center gap-2">
                    {classroom.hasCeiling ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-destructive" />}
                    <span className="flex items-center gap-1"><Star className="h-4 w-4 text-muted-foreground" /> Forro</span>
                </div>
                 <div className="flex items-center gap-2">
                    {classroom.hasBathroom ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-destructive" />}
                    <span className="flex items-center gap-1"><Bath className="h-4 w-4 text-muted-foreground" /> Banheiro</span>
                </div>
            </div>
        </div>
        {classroom.observations && (
            <div>
                <h4 className="font-semibold text-md mb-2">Observações</h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md whitespace-pre-wrap">{classroom.observations}</p>
            </div>
        )}
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

const sectionIcons: { [key: string]: React.ElementType } = {
  general: Building2,
  infrastructure: HardHat,
  professionals: UserCog,
  tech: Laptop,
  cultural: Palette,
  maintenance: Wrench,
};

const getSectionStatus = (submission: SchoolCensusSubmission | null, sectionId: string): boolean => {
    if (!submission) return false;

    if (sectionId === 'infrastructure') {
        return !!(submission.infrastructure?.classrooms && submission.infrastructure.classrooms.length > 0);
    }
    if (sectionId === 'professionals') {
        return !!(submission.professionals?.allocations && submission.professionals.allocations.some(a => a.teachers?.length > 0));
    }
    
    const sectionData = submission.dynamicData?.[sectionId];
    return !!(sectionData && Object.values(sectionData).some(v => v));
};

export function SubmissionDetail({ schoolId }: SubmissionDetailProps) {
    const [submission, setSubmission] = useState<SchoolCensusSubmission | null>(null);
    const [school, setSchool] = useState<School | null>(null);
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [formConfig, setFormConfig] = useState<FormSectionConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();
    
    const professionalMap = new Map(professionals.map(p => [p.id, p.name]));

    const fetchAllData = useCallback(async () => {
        if (!db) {
            console.error("Firestore instance not available");
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const schoolDocRef = doc(db, 'schools', schoolId);
            const submissionDocRef = doc(db, 'submissions', schoolId);
            const formConfigDocRef = doc(db, 'settings', 'formConfig');
            const professionalsQuery = collection(db, 'professionals');

            const [schoolDoc, submissionDoc, formConfigDoc, professionalsSnapshot] = await Promise.all([
                getDoc(schoolDocRef),
                getDoc(submissionDocRef),
                getDoc(formConfigDocRef),
                getDocs(professionalsQuery),
            ]);

            if (schoolDoc.exists()) {
                setSchool({ id: schoolDoc.id, ...schoolDoc.data() } as School);
            } else {
                console.warn("School not found");
            }

            if (submissionDoc.exists()) {
                setSubmission({ id: submissionDoc.id, ...submissionDoc.data() } as SchoolCensusSubmission);
            }

            if (formConfigDoc.exists()) {
                setFormConfig(formConfigDoc.data().sections || []);
            } else {
                console.warn("Form config not found");
            }
            
            if (professionalsSnapshot) {
                setProfessionals(professionalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Professional[]);
            }

        } catch (error) {
            console.error("Failed to load data from Firestore", error);
        } finally {
            setLoading(false);
        }
    }, [schoolId]);


    useEffect(() => {
        if (authLoading || !user) {
             if (!authLoading) setLoading(false);
            return;
        }
        fetchAllData();
    }, [schoolId, user, authLoading, fetchAllData]);

  if (loading || authLoading) {
    return (
        <div className="space-y-6">
             <Skeleton className="h-10 w-32" />
             <Skeleton className="h-12 w-96" />
             <Skeleton className="h-8 w-80" />
             <Skeleton className="h-24 w-full mt-4" />
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
                        <AlertTriangle/>
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
                        <Link href={`/census?schoolId=${schoolId}`}>Iniciar Preenchimento</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

  const getFormattedDate = (dateValue: any): string => {
    if (!dateValue) return 'N/A';

    try {
        let date: Date;
        if (dateValue instanceof Timestamp) {
            date = dateValue.toDate();
        } else if (dateValue instanceof Date) {
            date = dateValue;
        } else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
            date = new Date(dateValue);
        } else if (typeof dateValue === 'object' && dateValue.seconds) { // Handle serialized Timestamp
            date = new Timestamp(dateValue.seconds, dateValue.nanoseconds).toDate();
        } else {
             return 'N/A';
        }

        if (isNaN(date.getTime())) {
            return 'N/A';
        }

        return format(date, "dd 'de' MMMM 'de' yyyy, 'às' HH:mm", { locale: ptBR });
    } catch (error) {
        return 'N/A';
    }
  }

  const defaultOpenSections = formConfig
    .filter(sectionConfig => getSectionStatus(submission, sectionConfig.id))
    .map(section => section.id);


  return (
    <div className="space-y-6">
        <div>
            <Button variant="outline" asChild>
                <Link href="/admin/dashboard">← Voltar</Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight font-headline mt-4">Detalhes da Submissão</h1>
            {submission.submittedAt ? (
                <p className="text-muted-foreground">
                    Última atualização em: {getFormattedDate(submission.submittedAt)}
                </p>
            ) : (
                 <p className="text-muted-foreground">Censo em andamento. Nenhuma seção foi salva ainda.</p>
            )}
        </div>
      
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
      
      <Accordion type="multiple" className="w-full space-y-4" defaultValue={defaultOpenSections}>
        {formConfig.map(sectionConfig => {
            const Icon = sectionIcons[sectionConfig.id] || Building2;
            let content = null;
            const hasData = getSectionStatus(submission, sectionConfig.id);

            if (sectionConfig.id === 'infrastructure') {
                const classrooms = submission.infrastructure?.classrooms || [];
                content = hasData ? (
                    <div className="space-y-4">
                        {classrooms.map((classroom, index) => (
                            <Accordion key={classroom.id || index} type="single" collapsible className="w-full">
                                <AccordionItem value={`item-${index}`} className="border rounded-md px-4 bg-white dark:bg-zinc-900">
                                    <AccordionTrigger className="py-4 text-base font-medium">{classroom.name || `Sala ${index+1}`}</AccordionTrigger>
                                    <AccordionContent>
                                        <ClassroomDetails classroom={classroom} />
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        ))}
                    </div>
                ) : null;
            } else if (sectionConfig.id === 'professionals') {
                const allocations = submission.professionals?.allocations || [];
                content = hasData ? (
                    <div className="overflow-x-auto">
                        {allocations.map((alloc, index) => (
                            <div key={index} className="mb-6">
                                <h4 className="font-semibold text-base mb-2">{alloc.classroomName} - {alloc.grade} ({alloc.turn === 'morning' ? 'Manhã' : alloc.turn === 'afternoon' ? 'Tarde' : alloc.turn === 'night' ? 'Noite' : 'Integral'})</h4>
                                {alloc.teachers && alloc.teachers.length > 0 && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Professor(a) Atual</TableHead>
                                            <TableHead>Vínculo</TableHead>
                                            <TableHead>C.H.</TableHead>
                                            <TableHead>Obs.</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {alloc.teachers.map((teacher, teacherIndex) => (
                                            <TableRow key={teacherIndex}>
                                                <TableCell>{professionalMap.get(teacher.professionalId || '') || 'Não alocado'}</TableCell>
                                                <TableCell>{teacher.contractType || 'N/A'}</TableCell>
                                                <TableCell>{teacher.workload ? `${teacher.workload}h` : 'N/A'}</TableCell>
                                                <TableCell>
                                                    {teacher.observations && teacher.observations !== 'Nenhuma' ? (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{teacher.observations}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    ) : '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                )}
                                {alloc.teachers2026 && alloc.teachers2026.length > 0 && (
                                    <div className="mt-4">
                                        <h5 className="font-semibold text-sm mb-2">Projeção 2026</h5>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Professor(a) Projetado</TableHead>
                                                    <TableHead>Observações</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                 {alloc.teachers2026.map((teacher, teacherIndex) => (
                                                    <TableRow key={teacherIndex}>
                                                        <TableCell>{professionalMap.get(teacher.professionalId || '') || 'Não alocado'}</TableCell>
                                                        <TableCell>{teacher.observations || 'N/A'}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : null;
            } else {
                const sectionData = submission.dynamicData?.[sectionConfig.id];
                content = hasData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sectionConfig.fields.map(fieldConfig => {
                            const value = sectionData?.[fieldConfig.id];
                            let displayValue: React.ReactNode = "Não informado";
                            if (value !== undefined && value !== null && value !== '') {
                                if (typeof value === 'boolean') {
                                    displayValue = value ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-destructive" />;
                                } else if (fieldConfig.type === 'date' && value) {
                                    displayValue = format(new Date(value), "dd/MM/yyyy");
                                } else {
                                    displayValue = String(value);
                                }
                            }
                            return (
                                <div key={fieldConfig.id} className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">{fieldConfig.name}</p>
                                    <div className="font-semibold">{displayValue}</div>
                                </div>
                            );
                        })}
                    </div>
                ) : null;
            }

            return (
                <AccordionItem value={sectionConfig.id} key={sectionConfig.id} className="border-b-0">
                    <Card>
                        <AccordionTrigger className="p-6 text-left">
                            <CardTitle className="flex items-center gap-2"><Icon /> {sectionConfig.name}</CardTitle>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 space-y-4">
                            {hasData ? content : (
                                <Alert variant="default">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Seção não preenchida</AlertTitle>
                                    <AlertDescription>Esta seção ainda não foi preenchida.</AlertDescription>
                                </Alert>
                            )}
                        </AccordionContent>
                    </Card>
                </AccordionItem>
            );
        })}
      </Accordion>
    </div>
  );
}
