

"use client";

import { useState, useEffect, useMemo } from "react";
import type { SchoolCensusSubmission, School, FormSectionConfig } from "@/types";
import { MetricsCards } from "./MetricsCards";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, Timestamp, doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { X } from "lucide-react";
import { SubmissionsTable } from "./SubmissionsTable";
import { gradeLevels } from "@/components/census/SchoolCensusForm";

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
  const [formConfig, setFormConfig] = useState<FormSectionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  
  const [schoolFilter, setSchoolFilter] = useState("");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");

  useEffect(() => {
    // Wait for authentication to be resolved and user to be logged in
    if (authLoading || !user || !db) {
        if (!authLoading) setLoading(false);
        return;
    }

    setLoading(true);

    const schoolsQuery = collection(db, 'schools');
    const formConfigDocRef = doc(db, 'settings', 'formConfig');
    
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
    
    const formConfigUnsubscribe = onSnapshot(formConfigDocRef, (doc) => {
        if (doc.exists()) {
            setFormConfig(doc.data().sections || []);
        }
    }, (error) => {
        console.error("Error listening to form config:", error);
    });


    return () => {
      submissionsUnsubscribe();
      schoolsUnsubscribe();
      formConfigUnsubscribe();
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
        
        // If a grade is filtered, we need to check if the school has a submission with that grade
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

  const handleClearFilters = () => {
    setSchoolFilter("");
    setNeighborhoodFilter("");
    setGradeFilter("");
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
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filtrar por escola..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {schools.map(school => (
                                        <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                <MetricsCards submissions={filteredSubmissions} schools={filteredSchools} />
                <ChartsSection submissions={filteredSubmissions} schoolMap={schoolMap} formConfig={formConfig} gradeFilter={gradeFilter} />
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
                        <SubmissionsTable submissions={submissions} schoolMap={schoolMap} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}

    
