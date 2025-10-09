
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import type { SchoolCensusSubmission, School } from "@/types";

interface ChartsSectionProps {
  submissions: SchoolCensusSubmission[];
  schoolMap: Map<string, School>;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function ChartsSection({ submissions, schoolMap }: ChartsSectionProps) {

  const dataByNeighborhood = Array.from(schoolMap.values()).reduce((acc, school) => {
    const neighborhood = school.neighborhood || "Sem Bairro";
    if (!acc[neighborhood]) {
      acc[neighborhood] = {
        name: neighborhood,
        totalStudents: 0,
        projectedRooms2026: 0,
        schoolCount: 0,
      };
    }
    acc[neighborhood].schoolCount += 1;

    const submission = submissions.find(s => s.schoolId === school.id);
    if (submission?.infrastructure?.classrooms) {
      submission.infrastructure.classrooms.forEach(room => {
        acc[neighborhood].totalStudents += room.studentCapacity || 0;
        if (room.gradeProjection2026Morning || room.gradeProjection2026Afternoon) {
          acc[neighborhood].projectedRooms2026 += 1;
        }
      });
    }
    return acc;
  }, {} as Record<string, { name: string, totalStudents: number, projectedRooms2026: number, schoolCount: number }>);

  const studentsByNeighborhoodChartData = Object.values(dataByNeighborhood);
  const roomsByNeighborhoodChartData = Object.values(dataByNeighborhood);


  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background border rounded-md shadow-lg">
          <p className="font-bold">{label}</p>
          {payload.map((p: any) => (
            <p key={p.dataKey} className="text-sm" style={{ color: p.color }}>
              {`${p.name}: ${p.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };


  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Capacidade de Alunos por Bairro</CardTitle>
           <CardDescription>Soma da capacidade de todas as salas em cada bairro.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studentsByNeighborhoodChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
              <YAxis allowDecimals={false} />
              <Tooltip
                cursor={{fill: 'hsl(var(--muted))'}}
                content={<CustomTooltip />}
              />
              <Legend />
              <Bar dataKey="totalStudents" name="Total de Alunos" fill={COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Salas com Projeção para 2026</CardTitle>
          <CardDescription>Número de salas com projeção de turma para 2026 informada.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
             <BarChart data={roomsByNeighborhoodChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
              <YAxis allowDecimals={false}/>
              <Tooltip
                cursor={{fill: 'hsl(var(--muted))'}}
                content={<CustomTooltip />}
              />
              <Legend />
               <Bar dataKey="projectedRooms2026" name="Salas Projetadas" fill={COLORS[1]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
