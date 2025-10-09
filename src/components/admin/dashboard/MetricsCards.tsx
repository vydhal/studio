
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SchoolCensusSubmission, School } from "@/types";
import { Users, School2, Wifi, Armchair } from "lucide-react";

interface MetricsCardsProps {
  submissions: SchoolCensusSubmission[];
  schools: School[];
}

export function MetricsCards({ submissions, schools }: MetricsCardsProps) {
  
  const totalClassrooms = submissions.reduce((acc, sub) => acc + (sub.infrastructure?.classrooms?.length || 0), 0);
  
  const totalStudentCapacity = submissions.reduce((acc, sub) => {
    const classroomCapacity = sub.infrastructure?.classrooms?.reduce((classAcc, room) => classAcc + (room.studentCapacity || 0), 0) || 0;
    return acc + classroomCapacity;
  }, 0);


  // Use the length of the filtered schools array directly
  const totalSchools = schools.length;

  const completedSubmissions = submissions.filter(s => {
      // Assuming 5 sections for completion status for now
      const sections = [s.general, s.infrastructure, s.technology, s.cultural, s.maintenance];
      const completedCount = sections.filter(sec => sec?.status === 'completed').length;
      // This logic should be tied to the number of sections in formConfig. For now, assuming a fixed number might be fragile.
      // A better approach would be to pass formConfig length here.
      // Let's assume totalSections = 5 for now.
      const totalSections = 5; 
      return completedCount >= totalSections;
  }).length;


  const metrics = [
    { title: "Escolas", value: totalSchools, icon: School2, description: "Total de unidades no filtro" },
    { title: "Total de Alunos", value: totalStudentCapacity.toLocaleString(), icon: Users, description: "Capacidade total no filtro" },
    { title: "Salas de Aula", value: totalClassrooms.toLocaleString(), icon: Armchair, description: "Soma de todas as salas" },
    { title: "Questionários Completos", value: `${completedSubmissions}/${totalSchools}`, icon: Wifi, description: "Total de censos finalizados" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">{metric.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
