
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Pie, PieChart, Cell } from "recharts";
import type { SchoolCensusSubmission, School } from "@/types";

interface ChartsSectionProps {
  submissions: SchoolCensusSubmission[];
  schoolMap: Map<string, School>;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function ChartsSection({ submissions, schoolMap }: ChartsSectionProps) {
  
  const techResourcesBySchool = submissions.map(sub => {
    const schoolName = schoolMap.get(sub.schoolId)?.name.substring(0,15) + '...' || 'Desconhecida';
    const resources = sub.technology.resources.reduce((acc, resource) => {
        acc[resource.name] = resource.quantity;
        return acc;
    }, {} as Record<string, number>);
    return {
        name: schoolName,
        ...resources
    };
  });

  const allTechKeys = [...new Set(submissions.flatMap(s => s.technology.resources.map(r => r.name)))];

  const teachingModalitiesCount = submissions.flatMap(s => s.teachingModalities)
    .filter(m => m.offered)
    .reduce((acc, modality) => {
        acc[modality.name] = (acc[modality.name] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
  
  const totalOfferedModalities = Object.values(teachingModalitiesCount).reduce((sum, count) => sum + count, 0);

  const modalitiesChartData = Object.entries(teachingModalitiesCount).map(([name, value]) => ({
      name,
      value,
      percentage: totalOfferedModalities > 0 ? ((value / totalOfferedModalities) * 100).toFixed(0) : 0
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background border rounded-md shadow-lg">
          <p className="font-bold">{`${payload[0].name}`}</p>
          <p className="text-sm">{`Quantidade: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };
  
  const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, payload, index }: any) => {
      const RADIAN = Math.PI / 180;
      const radius = innerRadius + (outerRadius - innerRadius) * 1.25;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      return (
        <text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
          {`${payload.name} ${payload.percentage}%`}
        </text>
      );
  };


  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Recursos Tecnológicos por Escola</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={techResourcesBySchool}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
              <YAxis />
              <Tooltip
                cursor={{fill: 'hsl(var(--muted))'}}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                }}
              />
              <Legend />
              {allTechKeys.map((key, index) => (
                  <Bar key={key} dataKey={key} stackId="a" fill={COLORS[index % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Modalidades de Ensino</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
             <PieChart>
              <Pie
                data={modalitiesChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={<PieLabel />}
              >
                {modalitiesChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
