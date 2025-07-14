
"use client";

import { useState, useEffect } from "react";
import type { SchoolCensusSubmission, School } from "@/types";
import { MetricsCards } from "./MetricsCards";
import { ChartsSection } from "./ChartsSection";
import { SubmissionsTable } from "./SubmissionsTable";
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
import { Skeleton } from "@/components/ui/skeleton";


const SCHOOLS_STORAGE_KEY = 'schoolList';
const SUBMISSIONS_STORAGE_KEY = 'schoolCensusSubmissions';

const defaultSchools: School[] = [
    { id: 'school1', name: 'Escola Municipal Exemplo 1 (Padrão)', inep: '12345678' },
    { id: 'school2', name: 'Escola Estadual Teste 2 (Padrão)', inep: '87654321' },
    { id: 'school3', name: 'Centro Educacional Modelo 3 (Padrão)', inep: '98765432' },
];

export function DashboardClient() {
  const [submissions, setSubmissions] = useState<SchoolCensusSubmission[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    // Fetch data on the client side
    const storedSchools = localStorage.getItem(SCHOOLS_STORAGE_KEY);
    const schoolsData = storedSchools ? JSON.parse(storedSchools) : defaultSchools;
    setSchools(schoolsData);

    const storedSubmissions = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    const submissionsData = storedSubmissions ? Object.values(JSON.parse(storedSubmissions)) : [];

    setSubmissions(submissionsData as SchoolCensusSubmission[]);
    
    setLoading(false);
  }, []);

  const schoolMap = new Map(schools.map(s => [s.id, s]));

  const filteredSubmissions = submissions.filter(submission => {
    const school = schoolMap.get(submission.schoolId);
    if (!school) return false;
    return school.name.toLowerCase().includes(filter.toLowerCase()) || 
           school.inep.toLowerCase().includes(filter.toLowerCase());
  });
  
  const handleExport = () => {
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
      "Modalidades de Ensino",
      "Recursos Tecnológicos"
    ];

    const csvRows = filteredSubmissions.map(sub => {
      const school = schoolMap.get(sub.schoolId);
      if (!school) return null;

      const totalClassrooms = sub.infrastructure.classrooms?.length || 0;
      const totalStudentCapacity = sub.infrastructure.classrooms?.reduce((acc, c) => acc + (c.studentCapacity || 0), 0) || 0;
      const totalOutlets = sub.infrastructure.classrooms?.reduce((acc, c) => acc + (c.outlets || 0), 0) || 0;
      const totalTvs = sub.infrastructure.classrooms?.reduce((acc, c) => acc + (c.tvCount || 0), 0) || 0;
      
      const modalities = sub.teachingModalities
        ?.filter(m => m.offered)
        .map(m => m.name)
        .join('; ') || '';

      const resources = sub.technology.resources
        ?.map(r => `${r.name}: ${r.quantity}`)
        .join('; ') || '';

      return [
        `"${school.name}"`,
        `"${school.inep}"`,
        `"${sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('pt-BR') : 'N/A'}"`,
        `"${sub.general?.status || 'pendente'}"`,
        `"${sub.infrastructure?.status || 'pendente'}"`,
        `"${sub.technology?.status || 'pendente'}"`,
        totalClassrooms,
        totalStudentCapacity,
        totalOutlets,
        totalTvs,
        `"${sub.technology.hasInternetAccess ? 'Sim' : 'Não'}"`,
        `"${modalities}"`,
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


  if (loading) {
    return (
        <div className="space-y-4">
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
    <>
        <div className="flex items-center justify-between space-y-2">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
            <div className="flex items-center space-x-2">
                <Button onClick={handleExport}>Exportar</Button>
            </div>
        </div>

        <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="submissions">Submissões do Censo</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
                <MetricsCards submissions={submissions} schools={schools} />
                <ChartsSection submissions={filteredSubmissions} schoolMap={schoolMap} />
            </TabsContent>
            <TabsContent value="submissions" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Acompanhamento do Censo Escolar</CardTitle>
                        <CardDescription>
                            Acompanhe e gerencie o progresso do censo de cada escola.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SubmissionsTable submissions={filteredSubmissions} schoolMap={schoolMap} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </>
  );
}
