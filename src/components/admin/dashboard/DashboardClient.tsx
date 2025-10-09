
"use client";

import { useState, useEffect, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/firebase";
import { collection, getDocs, onSnapshot, Timestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { X } from "lucide-react";

const processSubmissionDoc = (doc: any): SchoolCensusSubmission => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        submittedAt: data.submittedAt instanceof Timestamp ? data.submittedAt.toDate() : new Date(data.submittedAt),
    } as SchoolCensusSubmission;
};


export function DashboardClient() {
  const [submissions, setSubmissions] = useState<SchoolCensusSubmission[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  
  const [nameFilter, setNameFilter] = useState("");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState("");

  useEffect(() => {
    // Wait for authentication to be resolved and user to be logged in
    if (authLoading || !user || !db) {
        if (!authLoading) setLoading(false);
        return;
    }

    setLoading(true);

    const schoolsQuery = collection(db, 'schools');
    
    // Set up real-time listeners
    const submissionsUnsubscribe = onSnapshot(collection(db, 'submissions'), (snapshot) => {
        const submissionsData = snapshot.docs.map(processSubmissionDoc);
        setSubmissions(submissionsData);
        setLoading(false);
    }, (error) => {
        console.error("Error listening to submissions:", error);
        setLoading(false);
    });
    
    const schoolsUnsubscribe = onSnapshot(schoolsQuery, (snapshot) => {
        const schoolsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as School[];
        setSchools(schoolsData);
    }, (error) => {
        console.error("Error listening to schools:", error);
    });

    return () => {
      submissionsUnsubscribe();
      schoolsUnsubscribe();
    }
  }, [user, authLoading]);

  const schoolMap = useMemo(() => new Map(schools.map(s => [s.id, s])), [schools]);

  const availableNeighborhoods = useMemo(() => {
    const neighborhoods = new Set(schools.map(s => s.neighborhood).filter(Boolean));
    return Array.from(neighborhoods).sort();
  }, [schools]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(submission => {
        const school = schoolMap.get(submission.schoolId);
        if (!school) return false;

        const nameMatch = nameFilter === "" || 
                          school.name.toLowerCase().includes(nameFilter.toLowerCase()) || 
                          school.inep.toLowerCase().includes(nameFilter.toLowerCase());

        const neighborhoodMatch = neighborhoodFilter === "" || school.neighborhood === neighborhoodFilter;

        return nameMatch && neighborhoodMatch;
    });
  }, [submissions, schoolMap, nameFilter, neighborhoodFilter]);

  const filteredSchools = useMemo(() => {
     const filteredSchoolIds = new Set(filteredSubmissions.map(s => s.schoolId));
     return schools.filter(school => {
        const nameMatch = nameFilter === "" || 
                          school.name.toLowerCase().includes(nameFilter.toLowerCase()) || 
                          school.inep.toLowerCase().includes(nameFilter.toLowerCase());

        const neighborhoodMatch = neighborhoodFilter === "" || school.neighborhood === neighborhoodFilter;
        
        // If there's a submission filter, only include schools that are in the filtered submissions
        if (submissions.length > 0) {
            return nameMatch && neighborhoodMatch && (filteredSubmissions.length > 0 ? filteredSchoolIds.has(school.id) : true);
        }
        
        // If no submissions yet, filter schools directly
        return nameMatch && neighborhoodMatch;
     });
  }, [schools, nameFilter, neighborhoodFilter, filteredSubmissions, submissions.length]);

  const handleClearFilters = () => {
    setNameFilter("");
    setNeighborhoodFilter("");
  };
  
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
      "Recursos Tecnológicos"
    ];

    const csvRows = filteredSubmissions.map(sub => {
      const school = schoolMap.get(sub.schoolId);
      if (!school) return null;

      const totalClassrooms = sub.infrastructure?.classrooms?.length || 0;
      const totalStudentCapacity = sub.infrastructure?.classrooms?.reduce((acc, c) => acc + (c.studentCapacity || 0), 0) || 0;
      const totalOutlets = sub.infrastructure?.classrooms?.reduce((acc, c) => acc + (c.outlets || 0), 0) || 0;
      const totalTvs = sub.infrastructure?.classrooms?.reduce((acc, c) => acc + (c.tvCount || 0), 0) || 0;
      
      const resources = sub.technology?.resources
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
        `"${sub.technology?.hasInternetAccess ? 'Sim' : 'Não'}"`,
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


  if (loading || authLoading) {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
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
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between space-y-2">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
            <div className="flex items-center space-x-2">
                <Button onClick={handleExport} >Exportar CSV</Button>
            </div>
        </div>

        <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="submissions">Submissões do Censo</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Filtros</CardTitle>
                        <CardDescription>Use os filtros para analisar os dados do censo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input 
                                placeholder="Filtrar por nome da escola ou INEP..."
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                            />
                            <Select value={neighborhoodFilter} onValueChange={setNeighborhoodFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filtrar por bairro..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Todos os Bairros</SelectItem>
                                    {availableNeighborhoods.map(bairro => (
                                        <SelectItem key={bairro} value={bairro}>{bairro}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={handleClearFilters} disabled={!nameFilter && !neighborhoodFilter}>
                                <X className="mr-2 h-4 w-4" />
                                Limpar Filtros
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <MetricsCards submissions={filteredSubmissions} schools={filteredSchools} />
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
    </div>
  );
}
