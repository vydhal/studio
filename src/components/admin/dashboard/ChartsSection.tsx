
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, Sector } from "recharts";
import type { SchoolCensusSubmission, School, FormSectionConfig } from "@/types";
import { useMemo, useState } from "react";
import { gradeLevels } from "@/components/census/SchoolCensusForm";

interface ChartsSectionProps {
  submissions: SchoolCensusSubmission[];
  schoolMap: Map<string, School>;
  formConfig: FormSectionConfig[];
  gradeFilter: string;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

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

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="hsl(var(--foreground))">{`Qtd ${value}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))">
        {`(Taxa ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};


export function ChartsSection({ submissions, schoolMap, formConfig, gradeFilter }: ChartsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const { neighborhoodChartData, modalitiesChartData, techByNeighborhoodData, projectionChartData } = useMemo(() => {
    // MODALITIES
    const generalSection = formConfig.find(s => s.id === 'general');
    const modalityFields = generalSection?.fields.filter(f => f.id.startsWith('f_mod_')) || [];
    
    const modalitiesCount = modalityFields.map(field => ({
        name: field.name,
        value: 0,
    }));

    // PROJECTIONS
    const projectionData: {
        name: string;
        current: number;
        proj2025: number;
        proj2026: number;
    }[] = [];

    if (gradeFilter) {
        const data = {
            name: gradeFilter,
            current: 0,
            proj2025: 0,
            proj2026: 0,
        };
        submissions.forEach(sub => {
            sub.infrastructure?.classrooms?.forEach(room => {
                if (room.gradeMorning === gradeFilter || room.gradeAfternoon === gradeFilter) {
                    data.current += 1;
                }
                if (room.gradeProjection2025Morning === gradeFilter || room.gradeProjection2025Afternoon === gradeFilter) {
                    data.proj2025 += 1;
                }
                if (room.gradeProjection2026Morning === gradeFilter || room.gradeProjection2026Afternoon === gradeFilter) {
                    data.proj2026 += 1;
                }
            });
        });
        projectionData.push(data);
    }


    submissions.forEach(sub => {
        const generalData = sub.dynamicData?.general;
        if(generalData){
            modalityFields.forEach((field, index) => {
                if(generalData[field.id]){
                    modalitiesCount[index].value += 1;
                }
            })
        }
    });

    // NEIGHBORHOOD
    const dataByNeighborhood = Array.from(schoolMap.values()).reduce((acc, school) => {
      const neighborhood = school.neighborhood || "Sem Bairro";
      if (!acc[neighborhood]) {
        acc[neighborhood] = {
          name: neighborhood,
          totalStudents: 0,
          projectedRooms2026: 0,
          schoolCount: 0,
          tvCount: 0,
          roomsWithInternet: 0,
          roomsWithAirCo: 0,
        };
      }
      acc[neighborhood].schoolCount += 1;

      const submission = submissions.find(s => s.schoolId === school.id);
      if (submission?.infrastructure?.classrooms) {
        submission.infrastructure.classrooms.forEach(room => {
          acc[neighborhood].totalStudents += room.studentCapacity || 0;
          acc[neighborhood].tvCount += room.tvCount || 0;
          if (room.hasInternet) acc[neighborhood].roomsWithInternet +=1;
          if (room.hasAirConditioning) acc[neighborhood].roomsWithAirCo += 1;

          if (room.gradeProjection2026Morning || room.gradeProjection2026Afternoon) {
            acc[neighborhood].projectedRooms2026 += 1;
          }
        });
      }
      return acc;
    }, {} as Record<string, { name: string, totalStudents: number, projectedRooms2026: number, schoolCount: number, tvCount: number, roomsWithInternet: number, roomsWithAirCo: number }>);

    return {
        neighborhoodChartData: Object.values(dataByNeighborhood),
        modalitiesChartData: modalitiesCount.filter(m => m.value > 0),
        techByNeighborhoodData: Object.values(dataByNeighborhood),
        projectionChartData: projectionData
    };
  }, [submissions, schoolMap, formConfig, gradeFilter]);


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
       <Card>
        <CardHeader>
          <CardTitle>Modalidades de Ensino Ofertadas</CardTitle>
           <CardDescription>Distribuição das modalidades nas escolas do filtro.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={modalitiesChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                    onMouseEnter={onPieEnter}
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
      <Card>
        <CardHeader>
          <CardTitle>Recursos por Bairro</CardTitle>
          <CardDescription>Soma de recursos de tecnologia e infraestrutura por bairro.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
             <BarChart data={techByNeighborhoodData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false}/>
              <Tooltip
                cursor={{fill: 'hsl(var(--muted))'}}
                content={<CustomTooltip />}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }}/>
               <Bar dataKey="tvCount" name="Nº de TVs" stackId="a" fill={COLORS[0]} />
               <Bar dataKey="roomsWithInternet" name="Salas com Internet" stackId="a" fill={COLORS[1]} />
               <Bar dataKey="roomsWithAirCo" name="Salas com Ar" stackId="a" fill={COLORS[2]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Capacidade de Alunos por Bairro</CardTitle>
           <CardDescription>Soma da capacidade de todas as salas em cada bairro.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={neighborhoodChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip
                cursor={{fill: 'hsl(var(--muted))'}}
                content={<CustomTooltip />}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }}/>
              <Bar dataKey="totalStudents" name="Total de Alunos" fill={COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Projeção de Turmas (2025-2026)</CardTitle>
          <CardDescription>{gradeFilter ? `Mostrando projeções para: ${gradeFilter}`: "Selecione uma série no filtro para ver as projeções."}</CardDescription>
        </CardHeader>
        <CardContent>
            {gradeFilter ? (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={projectionChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false}/>
                        <Tooltip
                            cursor={{fill: 'hsl(var(--muted))'}}
                            content={<CustomTooltip />}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                        <Bar dataKey="current" name="Turmas Atuais" fill={COLORS[0]} />
                        <Bar dataKey="proj2025" name="Projeção 2025" fill={COLORS[1]} />
                        <Bar dataKey="proj2026" name="Projeção 2026" fill={COLORS[2]} />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Selecione uma série para visualizar os dados.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
