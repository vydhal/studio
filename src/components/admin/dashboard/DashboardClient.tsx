
"use client";

import { useState } from "react";
import type { SchoolCensusSubmission, School } from "@/types";
import { MetricsCards } from "./MetricsCards";
import { ChartsSection } from "./ChartsSection";
import { SubmissionsTable } from "./SubmissionsTable";
import { Input } from "@/components/ui/input";
import {
  File,
  Home,
  LineChart,
  ListFilter,
  MoreHorizontal,
  PanelLeft,
  PlusCircle,
  Search,
  Settings,
  ShoppingCart,
  Users2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <div className="flex items-center space-x-2">
                <Button>Exportar</Button>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Visão Geral</h2>
            <Badge variant="outline">Enviadas: {submissions.length}</Badge>
            <Badge variant="outline">Pendentes: {pendingSubmissions}</Badge>
            <Badge variant="outline">Total: {schools.length}</Badge>
        </div>
        <Tabs defaultValue="overview">
            <TabsList>
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="submissions">Submissões</TabsTrigger>
                <TabsTrigger value="form-editor" disabled>Editor de Formulário</TabsTrigger>
                <TabsTrigger value="home-editor" disabled>Editor da Home</TabsTrigger>
                <TabsTrigger value="reports" disabled>Relatórios</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
                <MetricsCards submissions={submissions} schools={schools} />
                <ChartsSection submissions={filteredSubmissions} schoolMap={schoolMap} />
            </TabsContent>
            <TabsContent value="submissions" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Submissões</CardTitle>
                        <CardDescription>
                            Gerencie as submissões do censo escolar.
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
