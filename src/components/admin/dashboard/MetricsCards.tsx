import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SchoolCensusSubmission, School } from "@/types";
import { Users, School2, Wifi, Armchair } from "lucide-react";

interface MetricsCardsProps {
  submissions: SchoolCensusSubmission[];
  schools: School[];
}

export function MetricsCards({ submissions, schools }: MetricsCardsProps) {
  
  const totalClassrooms = submissions.reduce((acc, sub) => acc + (sub.infrastructure?.classrooms?.length || 0), 0);
  
  const totalDesks = submissions.reduce((acc, sub) => {
    const generalData = sub.dynamicData?.general;
    if (generalData) {
      const deskField = Object.keys(generalData).find(key => key.startsWith('f_desk_'));
      if (deskField && typeof generalData[deskField] === 'number') {
        return acc + generalData[deskField];
      }
    }
    return acc;
  }, 0);


  const schoolsWithInternet = submissions.filter(s => s.technology?.hasInternetAccess).length;
  
  const completedSubmissions = submissions.filter(s => {
      const sections = [s.general, s.infrastructure, s.technology, s.cultural, s.maintenance];
      return sections.every(sec => sec?.status === 'completed');
  }).length;


  const metrics = [
    { title: "Escolas Cadastradas", value: schools.length, icon: School2, description: "Total de unidades" },
    { title: "Total de Carteiras", value: totalDesks, icon: Armchair, description: "Soma de todas as unidades" },
    { title: "Salas de Aula", value: totalClassrooms, icon: Users, description: "Soma de todas as salas" },
    { title: "Questionários Completos", value: `${completedSubmissions}/${schools.length}`, icon: Wifi, description: "Total de censos finalizados" },
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
