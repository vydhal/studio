"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import type { SchoolCensusSubmission, School } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChartsSectionProps {
  submissions: SchoolCensusSubmission[];
  schoolMap: Map<string, School>;
}

export function ChartsSection({ submissions, schoolMap }: ChartsSectionProps) {
  const submissionsByDate = submissions.reduce((acc, sub) => {
    const date = format(sub.submittedAt, "dd/MM/yyyy");
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData1 = Object.entries(submissionsByDate)
    .map(([date, count]) => ({ date, submissões: count }))
    .reverse();

  const studentsPerSchool = submissions.map(sub => ({
      name: schoolMap.get(sub.schoolId)?.name.substring(0,15) + '...' || 'Desconhecida',
      vagas: sub.classrooms.reduce((total, c) => total + c.studentCapacity, 0)
  })).slice(0, 10); // show top 10 for readability

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Submissões por Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData1}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                }}
              />
              <Legend />
              <Bar dataKey="submissões" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Vagas por Escola (Top 10)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studentsPerSchool}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                }}
              />
              <Legend />
              <Bar dataKey="vagas" fill="hsl(var(--accent))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
