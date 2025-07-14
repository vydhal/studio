import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SchoolCensusSubmission, School } from "@/types";
import { FileText, Users, School2, BookOpen } from "lucide-react";

interface MetricsCardsProps {
  submissions: SchoolCensusSubmission[];
  schools: School[];
}

export function MetricsCards({ submissions, schools }: MetricsCardsProps) {
  const totalSubmissions = submissions.length;
  
  const totalStudents = submissions.reduce((acc, sub) => {
    const classStudents = sub.classrooms.reduce((sum, c) => sum + c.studentCount, 0);
    // Note: this might double count if modalities are subsets of classrooms.
    // For this example, we'll assume they are distinct counts or the user is aware.
    // A better approach would be to have a single source of truth for student counts.
    return acc + classStudents;
  }, 0);

  const totalSchoolsWithSubmissions = new Set(submissions.map(s => s.schoolId)).size;

  const totalModalities = submissions.reduce((acc, sub) => acc + sub.teachingModalities.length, 0);

  const metrics = [
    { title: "Total de Submissões", value: totalSubmissions, icon: FileText },
    { title: "Total de Alunos", value: totalStudents.toLocaleString(), icon: Users },
    { title: "Escolas com Dados", value: `${totalSchoolsWithSubmissions} de ${schools.length}`, icon: School2 },
    { title: "Modalidades de Ensino", value: totalModalities, icon: BookOpen },
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
