
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


// Mock data to simulate Firestore fetch
const getMockSubmissions = (): SchoolCensusSubmission[] => {
  const now = new Date();
  return [
    {
      id: 'sub1',
      schoolId: 'school1',
      general: { status: 'completed' },
      infrastructure: { 
        status: 'completed',
        classrooms: [
            { id: 'c1', name: 'Sala 1', studentCapacity: 25, outlets: 10, tvCount: 1, chairCount: 25, fanCount: 2, hasInternet: true, hasAirConditioning: false },
            { id: 'c2', name: 'Sala 2', studentCapacity: 30, outlets: 12, tvCount: 1, chairCount: 30, fanCount: 2, hasInternet: true, hasAirConditioning: true },
        ]
      },
      technology: { 
        status: 'completed',
        resources: [{ id: '1', name: 'Chromebooks', quantity: 20 }, { id: '2', name: 'Impressoras', quantity: 2 }],
        hasInternetAccess: true
      },
      cultural: { status: 'pending' },
      maintenance: { status: 'completed' },
      teachingModalities: [{ id: '1', name: 'Anos Iniciais', offered: true }, { id: '2', name: 'Anos Finais', offered: true }],
      submittedAt: new Date(now.setDate(now.getDate() - 1)),
      submittedBy: 'test-user'
    },
    {
      id: 'sub2',
      schoolId: 'school2',
      general: { status: 'completed' },
      infrastructure: { 
        status: 'completed',
        classrooms: [
            { id: 'c1', name: 'Sala A', studentCapacity: 20, outlets: 8, tvCount: 1, chairCount: 20, fanCount: 1, hasInternet: false, hasAirConditioning: false },
        ]
      },
      technology: { 
        status: 'pending',
        resources: [{ id: '3', name: 'Notebooks', quantity: 15 }],
        hasInternetAccess: true,
      },
      cultural: { status: 'pending' },
      maintenance: { status: 'pending' },
      teachingModalities: [{ id: '3', name: 'EJA', offered: true }],
      submittedAt: new Date(now.setDate(now.getDate() - 2)),
      submittedBy: 'test-user-2'
    }
  ];
};

const defaultSchools: School[] = [
    { id: 'school1', name: 'Escola Municipal Exemplo 1 (Padrão)', inep: '12345678' },
    { id: 'school2', name: 'Escola Estadual Teste 2 (Padrão)', inep: '87654321' },
    { id: 'school3', name: 'Centro Educacional Modelo 3 (Padrão)', inep: '98765432' },
];

const SCHOOLS_STORAGE_KEY = 'schoolList';


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

    const submissionsData = getMockSubmissions();
    setSubmissions(submissionsData);
    
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

      const totalClassrooms = sub.infrastructure.classrooms.length;
      const totalStudentCapacity = sub.infrastructure.classrooms.reduce((acc, c) => acc + c.studentCapacity, 0);
      const totalOutlets = sub.infrastructure.classrooms.reduce((acc, c) => acc + c.outlets, 0);
      const totalTvs = sub.infrastructure.classrooms.reduce((acc, c) => acc + c.tvCount, 0);
      
      const modalities = sub.teachingModalities
        .filter(m => m.offered)
        .map(m => m.name)
        .join('; ');

      const resources = sub.technology.resources
        .map(r => `${r.name}: ${r.quantity}`)
        .join('; ');

      return [
        `"${school.name}"`,
        `"${school.inep}"`,
        `"${new Date(sub.submittedAt).toLocaleString('pt-BR')}"`,
        `"${sub.general.status}"`,
        `"${sub.infrastructure.status}"`,
        `"${sub.technology.status}"`,
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
                <Button onClick={handleExport} disabled={filteredSubmissions.length === 0}>Exportar</Button>
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
                        <CardTitle>Submissões do Censo Escolar</CardTitle>
                        <CardDescription>
                            Acompanhe e gerencie as submissões de cada escola.
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
