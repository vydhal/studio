
"use client";

import { useState } from "react";
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


interface DashboardClientProps {
  submissions: SchoolCensusSubmission[];
  schools: School[];
}

export function DashboardClient({ submissions, schools }: DashboardClientProps) {
  const [filter, setFilter] = useState("");

  const schoolMap = new Map(schools.map(s => [s.id, s]));

  const filteredSubmissions = submissions.filter(submission => {
    const school = schoolMap.get(submission.schoolId);
    if (!school) return false;
    return school.name.toLowerCase().includes(filter.toLowerCase()) || 
           school.inep.toLowerCase().includes(filter.toLowerCase());
  });

  const pendingSubmissions = submissions.filter(s => {
      const sections = [s.general, s.infrastructure, s.technology, s.cultural, s.maintenance];
      return sections.some(sec => sec.status === 'pending');
  }).length;

  return (
    <>
        <div className="flex items-center justify-between space-y-2">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
            <div className="flex items-center space-x-2">
                <Button disabled>Exportar</Button>
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
