

"use client";

import { useState, useEffect, useMemo } from "react";
import type { SchoolCensusSubmission, School, FormSectionConfig, Professional, VacancyDetail } from "@/types";
import { MetricsCards, calculateVacancyData } from "./MetricsCards";
import { ChartsSection } from "./ChartsSection";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, Timestamp, doc, getDoc, deleteDoc, getDocs } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { X, ChevronsUpDown, Check } from "lucide-react";
import { SubmissionsTable } from "./SubmissionsTable";
import { TeacherProjectionsTable } from "./TeacherProjectionsTable";
import { ClassProjectionsTable } from "./ClassProjectionsTable";
import { VacancyProjectionsTable } from "./VacancyProjectionsTable";
import { gradeLevels } from "@/components/census/SchoolCensusForm";
import { useAppSettings } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const processSubmissionDoc = (doc: any): SchoolCensusSubmission => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        submittedAt: data.submittedAt, // Pass Timestamp or serialized object directly
    } as SchoolCensusSubmission;
};


export function DashboardClient() {
  const [submissions, setSubmissions] = useState<SchoolCensusSubmission[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const { settings, loading: appLoading } = useAppSettings();
  const { toast } = useToast();
  const formConfig = settings?.formConfig || [];
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  
  const [schoolFilter, setSchoolFilter] = useState("");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [schoolPopoverOpen, setSchoolPopoverOpen] = useState(false);


  useEffect(() => {
    if (authLoading || appLoading) return;
    if (!user || !db) {
        setLoading(false);
        return;
    }

    setLoading(true);

    const submissionsUnsubscribe = onSnapshot(collection(db, 'submissions'), (snapshot) => {
        const submissionsData = snapshot.docs.map(processSubmissionDoc);
        setSubmissions(submissionsData);
        setLoading(false);
    }, (error) => {
        console.error("Error listening to submissions:", error);
        setLoading(false);
    });
    
    const schoolsUnsubscribe = onSnapshot(collection(db, 'schools'), (snapshot) => {
        const schoolsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as School[];
        setSchools(schoolsData);
    }, (error) => {
        console.error("Error listening to schools:", error);
    });

    const professionalsUnsubscribe = onSnapshot(collection(db, 'professionals'), (snapshot) => {
        const professionalsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Professional[];
        setProfessionals(professionalsData);
    }, (error) => {
        console.error("Error listening to professionals:", error);
    });
    
    return () => {
      submissionsUnsubscribe();
      schoolsUnsubscribe();
      professionalsUnsubscribe();
    }
  }, [user, authLoading, appLoading]);

  const schoolMap = useMemo(() => new Map(schools.map(s => [s.id, s])), [schools]);
  const submissionMap = useMemo(() => new Map(submissions.map(s => [s.schoolId, s])), [submissions]);
  const professionalMap = useMemo(() => new Map(professionals.map(p => [p.id, p.name])), [professionals]);


  const availableNeighborhoods = useMemo(() => {
    const neighborhoods = new Set(schools.map(s => s.neighborhood).filter(Boolean));
    return Array.from(neighborhoods).sort();
  }, [schools]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(submission => {
        const school = schoolMap.get(submission.schoolId);
        if (!school) return false;

        const schoolMatch = schoolFilter === "" || school.id === schoolFilter;
        const neighborhoodMatch = neighborhoodFilter === "" || school.neighborhood === neighborhoodFilter;
        
        const gradeMatch = gradeFilter === "" || submission.infrastructure?.classrooms?.some(c => 
            c.gradeMorning === gradeFilter || c.gradeAfternoon === gradeFilter
        );

        return schoolMatch && neighborhoodMatch && gradeMatch;
    });
  }, [submissions, schoolMap, schoolFilter, neighborhoodFilter, gradeFilter]);

  const filteredSchools = useMemo(() => {
     return schools.filter(school => {
        const schoolMatch = schoolFilter === "" || school.id === schoolFilter;
        const neighborhoodMatch = neighborhoodFilter === "" || school.neighborhood === neighborhoodFilter;
        
        if (gradeFilter) {
            const submission = submissions.find(s => s.schoolId === school.id);
            const gradeMatch = submission?.infrastructure?.classrooms?.some(c => 
                c.gradeMorning === gradeFilter || c.gradeAfternoon === gradeFilter
            );
            return schoolMatch && neighborhoodMatch && gradeMatch;
        }

        return schoolMatch && neighborhoodMatch;
     });
  }, [schools, submissions, schoolFilter, neighborhoodFilter, gradeFilter]);
  
  const vacancyData = useMemo(() => calculateVacancyData(filteredSubmissions), [filteredSubmissions]);

  const handleClearFilters = () => {
    setSchoolFilter("");
    setNeighborhoodFilter("");
    setGradeFilter("");
  };

  const handleDeleteSubmission = async (schoolId: string) => {
    if (!db) return;
    try {
        await deleteDoc(doc(db, 'submissions', schoolId));
        toast({
            title: "Submissão Excluída!",
            description: "Os dados do censo para esta escola foram removidos.",
        });
    } catch (error) {
        console.error("Error deleting submission:", error);
        toast({
            title: "Erro ao Excluir",
            description: "Não foi possível remover a submissão.",
            variant: "destructive",
        });
    }
  };
  
  const handleExport = () => {
    if (!formConfig.length) return;
    const csvHeader = [
      "Nome da Escola",
      "INEP",
      "Data da Submissão",
      "Status Geral",
      "Status Infraestrutura",
      "Status Tecnologia",
      "Total de Salas",
      "Capacidade Total Alunos",
      "Total Tomadas",
      "Total TVs",
      "Acesso à Internet Pedagógica",
      "Recursos Tecnológicos"
    ];

    const csvRows = filteredSubmissions.map(sub => {
      const school = schoolMap.get(sub.schoolId);
      if (!school) return null;

      const totalClassrooms = sub.infrastructure?.classrooms?.length || 0;
      const totalStudentCapacity = sub.infrastructure?.classrooms?.reduce((acc, c) => acc + (c.studentCapacity || 0), 0) || 0;
      
      const resources = sub.dynamicData?.tech
        ? Object.entries(sub.dynamicData.tech).map(([key, value]) => {
            const field = formConfig.find(s => s.id === 'tech')?.fields.find(f => f.id === key);
            return field ? `${field.name}: ${value}` : '';
          }).filter(Boolean).join('; ')
        : '';
      
      const modalidades = sub.dynamicData?.general
        ? Object.entries(sub.dynamicData.general).map(([key, value]) => {
            if (key.startsWith('f_mod_') && value === true) {
              const field = formConfig.find(s => s.id === 'general')?.fields.find(f => f.id === key);
              return field ? field.name : '';
            }
            return '';
          }).filter(Boolean).join('; ')
        : '';

      const submittedAtDate = sub.submittedAt && 'toDate' in sub.submittedAt 
        ? (sub.submittedAt as Timestamp).toDate() 
        : sub.submittedAt;

      return [
        `"${school.name}"`,
        `"${school.inep}"`,
        `"${submittedAtDate ? new Date(submittedAtDate).toLocaleString('pt-BR') : 'N/A'}"`,
        `"${(sub.general && Object.keys(sub.general).length > 0) ? 'completed' : 'pending'}"`,
        `"${(sub.infrastructure && sub.infrastructure.classrooms.length > 0) ? 'completed' : 'pending'}"`,
        `"${(sub.technology && Object.keys(sub.technology).length > 0) ? 'completed' : 'pending'}"`,
        totalClassrooms,
        totalStudentCapacity,
        'N/A', // Total Outlets removed
        'N/A', // Total TVs removed
        `"${sub.dynamicData?.tech?.f_tech_1 ? 'Sim' : 'Não'}"`,
        `"${modalidades}"`,
        `"${resources}"`
      ].join(',');
    }).filter(Boolean);

    const csvContent = [csvHeader.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'export_censo_escolar.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleProjectionsExport = () => {
    const csvHeader = [
      "Escola",
      "Sala",
      "Turma/Turno",
      "Professor(a) Atual",
      "Matrícula (Atual)",
      "Turno (Atual)",
      "Vínculo (Atual)",
      "C.H (Atual)",
      "Anotações (Atual)",
      "Professor(a) 2026",
      "Matrícula (2026)",
      "Turno (2026)",
      "Vínculo (2026)",
      "C.H (2026)",
      "Anotações (2026)",
    ];

    const rows: string[] = [];

    filteredSubmissions.forEach(sub => {
        const school = schoolMap.get(sub.schoolId);
        if (!school || !sub.professionals?.allocations) return;

        sub.professionals.allocations.forEach(alloc => {
            const turnText = alloc.turn === 'morning' ? 'Manhã' : alloc.turn === 'afternoon' ? 'Tarde' : alloc.turn === 'night' ? 'Noite' : 'Integral';
            
            const currentTeachers = alloc.teachers || [];
            const projectedTeachers = alloc.teachers2026 || [];
            const maxRows = Math.max(currentTeachers.length, projectedTeachers.length);

            for (let i = 0; i < maxRows; i++) {
                const current = currentTeachers[i];
                const projected = projectedTeachers[i];
                rows.push([
                    `"${school.name}"`,
                    `"${alloc.classroomName}"`,
                    `"${alloc.grade} (${turnText})"`,
                    `"${current ? professionalMap.get(current.professionalId || '') || '' : ''}"`,
                    `"${current?.matricula || ''}"`,
                    `"${current?.turn || ''}"`,
                    `"${current?.contractType || ''}"`,
                    `"${current?.workload || ''}"`,
                    `"${current?.annotations || ''}"`,
                    `"${projected ? professionalMap.get(projected.professionalId || '') || '' : ''}"`,
                    `"${projected?.matricula || ''}"`,
                    `"${projected?.turn || ''}"`,
                    `"${projected?.contractType || ''}"`,
                    `"${projected?.workload || ''}"`,
                    `"${projected?.annotations || ''}"`,
                ].join(','));
            }
        });
    });

    const csvContent = [csvHeader.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'export_projecao_professores.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClassProjectionsExport = () => {
    const csvHeader = [
      "Unidade Fornecedora",
      "Sala",
      "Turma/Turno Atual",
      "Alunos Atuais",
      "Transf. Casada",
      "Unidade Receptora",
      "Projeção Turma 2026",
    ];
    
    const rows: string[] = [];

    filteredSubmissions.forEach(sub => {
      const school = schoolMap.get(sub.schoolId);
      if (!school || !sub.infrastructure?.classrooms) return;

      sub.infrastructure.classrooms.forEach(room => {
        
        const getReceptoraNames = (schoolIds?: string[]) => {
            if (!schoolIds || schoolIds.length === 0) return 'N/A';
            return schoolIds.map(id => schoolMap.get(id)?.name || 'N/A').join('; ');
        };

        if (room.occupationType === 'integral') {
          if (room.gradeIntegral) {
            rows.push([
              `"${school.name}"`,
              `"${room.name}"`,
              `"${room.gradeIntegral} (Integral)"`,
              room.studentsIntegral || 0,
              `"${room.hasLinkedTransferIntegral ? 'Sim' : 'Não'}"`,
              `"${getReceptoraNames(room.linkedTransferSchoolIdsIntegral)}"`,
              `"${room.gradeProjection2026Integral || 'N/A'}"`,
            ].join(','));
          }
        } else {
          if (room.gradeMorning) {
            rows.push([
              `"${school.name}"`,
              `"${room.name}"`,
              `"${room.gradeMorning} (Manhã)"`,
              room.studentsMorning || 0,
              `"${room.hasLinkedTransferMorning ? 'Sim' : 'Não'}"`,
              `"${getReceptoraNames(room.linkedTransferSchoolIdsMorning)}"`,
              `"${room.gradeProjection2026Morning || 'N/A'}"`,
            ].join(','));
          }
          if (room.gradeAfternoon) {
            rows.push([
              `"${school.name}"`,
              `"${room.name}"`,
              `"${room.gradeAfternoon} (Tarde)"`,
              room.studentsAfternoon || 0,
              `"${room.hasLinkedTransferAfternoon ? 'Sim' : 'Não'}"`,
              `"${getReceptoraNames(room.linkedTransferSchoolIdsAfternoon)}"`,
              `"${room.gradeProjection2026Afternoon || 'N/A'}"`,
            ].join(','));
          }
          if (room.gradeNight) {
            rows.push([
              `"${school.name}"`,
              `"${room.name}"`,
              `"${room.gradeNight} (Noite)"`,
              room.studentsNight || 0,
              `"${room.hasLinkedTransferNight ? 'Sim' : 'Não'}"`,
              `"${getReceptoraNames(room.linkedTransferSchoolIdsNight)}"`,
              `"${room.gradeProjection2026Night || 'N/A'}"`,
            ].join(','));
          }
        }
      });
    });

    const csvContent = [csvHeader.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'export_projecao_turmas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
   const handleVacancyExport = () => {
    const csvHeader = [
        "Unidade",
        "Sala",
        "Turma 2026",
        "Capacidade",
        "Veteranos",
        "Novatos",
        "Total Alunos (2026)",
        "Turma 2025",
        "Matriculados 2025",
    ];

    const rows: string[] = vacancyData.details.map(detail => [
        `"${schoolMap.get(detail.schoolId)?.name || 'N/A'}"`,
        `"${detail.classroomName}"`,
        `"${detail.projectedGrade} (${detail.turn})"`,
        detail.capacity,
        detail.veterans,
        detail.newcomers,
        detail.total,
        `"${detail.grade2025}"`,
        detail.students2025,
    ].join(','));
    
    const csvContent = [csvHeader.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'export_vagas_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  if (loading || authLoading || appLoading) {
    return (
        <div className="flex flex-1 flex-col gap-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-12 w-full" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
             <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-80" />
                <Skeleton className="h-80" />
            </div>
        </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-between space-y-2">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
        </div>

        <Tabs defaultValue="overview">
            <TabsList className="flex flex-wrap h-auto">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="submissions">Submissões do Censo</TabsTrigger>
                <TabsTrigger value="teacher_projections">Projeção de Professores</TabsTrigger>
                <TabsTrigger value="class_projections">Projeção de Turmas</TabsTrigger>
                <TabsTrigger value="vacancies_2026">Vagas 2026</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Filtros</CardTitle>
                        <CardDescription>Use os filtros para analisar os dados do censo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                             <Popover open={schoolPopoverOpen} onOpenChange={setSchoolPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={schoolPopoverOpen}
                                    className="w-full justify-between"
                                    >
                                    {schoolFilter
                                        ? schools.find((school) => school.id === schoolFilter)?.name
                                        : "Filtrar por escola..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                                    <Command>
                                        <CommandInput placeholder="Buscar escola..." />
                                        <CommandList>
                                            <CommandEmpty>Nenhuma escola encontrada.</CommandEmpty>
                                            <CommandGroup>
                                                {schools.map((school) => (
                                                <CommandItem
                                                    key={school.id}
                                                    value={school.name}
                                                    onSelect={() => {
                                                        setSchoolFilter(school.id === schoolFilter ? "" : school.id)
                                                        setSchoolPopoverOpen(false)
                                                    }}
                                                >
                                                    <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        schoolFilter === school.id ? "opacity-100" : "opacity-0"
                                                    )}
                                                    />
                                                    {school.name}
                                                </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <Select value={neighborhoodFilter} onValueChange={setNeighborhoodFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filtrar por bairro..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableNeighborhoods.map(bairro => (
                                        <SelectItem key={bairro} value={bairro}>{bairro}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={gradeFilter} onValueChange={setGradeFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filtrar por série..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {gradeLevels.map(grade => (
                                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={handleClearFilters} disabled={!schoolFilter && !neighborhoodFilter && !gradeFilter}>
                                <X className="mr-2 h-4 w-4" />
                                Limpar Filtros
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <MetricsCards submissions={filteredSubmissions} schools={filteredSchools} vacancyData={vacancyData} />
                <ChartsSection submissions={filteredSubmissions} schoolMap={schoolMap} formConfig={formConfig} gradeFilter={gradeFilter} />
            </TabsContent>
            <TabsContent value="submissions" className="space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Acompanhamento do Censo Escolar</CardTitle>
                          <CardDescription>
                              Acompanhe e gerencie o progresso do censo de cada escola.
                          </CardDescription>
                        </div>
                        <Button onClick={handleExport} disabled={!formConfig.length}>Exportar CSV Geral</Button>
                    </CardHeader>
                    <CardContent>
                        <SubmissionsTable schools={schools} submissionMap={submissionMap} onDelete={handleDeleteSubmission}/>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="teacher_projections" className="space-y-4">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Projeção de Professores para 2026</CardTitle>
                          <CardDescription>
                              Visualize a alocação atual de professores em contraste com a projeção para 2026.
                          </CardDescription>
                        </div>
                         <Button onClick={handleProjectionsExport} disabled={filteredSubmissions.length === 0}>Exportar CSV de Projeções</Button>
                    </CardHeader>
                    <CardContent>
                        <TeacherProjectionsTable
                            submissions={filteredSubmissions}
                            schoolMap={schoolMap}
                            professionalMap={professionalMap}
                        />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="class_projections" className="space-y-4">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Projeção de Turmas para 2026</CardTitle>
                          <CardDescription>
                              Visualize a projeção de turmas e alunos para 2026 com base nos dados atuais.
                          </CardDescription>
                        </div>
                         <Button onClick={handleClassProjectionsExport} disabled={filteredSubmissions.length === 0}>Exportar CSV de Turmas</Button>
                    </CardHeader>
                    <CardContent>
                        <ClassProjectionsTable
                            submissions={filteredSubmissions}
                            schoolMap={schoolMap}
                        />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="vacancies_2026" className="space-y-4">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Projeção de Vagas para 2026</CardTitle>
                          <CardDescription>
                              Análise de vagas para novatos e veteranos para o ano letivo de 2026.
                          </CardDescription>
                        </div>
                         <Button onClick={handleVacancyExport} disabled={vacancyData.details.length === 0}>Exportar CSV de Vagas</Button>
                    </CardHeader>
                    <CardContent>
                        <VacancyProjectionsTable
                            vacancyData={vacancyData.details}
                            schoolMap={schoolMap}
                        />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
