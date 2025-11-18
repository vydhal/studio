
"use client";

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SchoolCensusSubmission, School, Professional, TeacherAllocation } from "@/types";

interface TeacherProjectionsTableProps {
  submissions: SchoolCensusSubmission[];
  schoolMap: Map<string, School>;
  professionalMap: Map<string, string>;
}

interface ProjectionRow {
    schoolName: string;
    classroomName: string;
    grade: string;
    turn: string;
    current?: TeacherAllocation;
    projected?: TeacherAllocation;
}

export function TeacherProjectionsTable({ submissions, schoolMap, professionalMap }: TeacherProjectionsTableProps) {

  const projectionData = React.useMemo(() => {
    const data: ProjectionRow[] = [];

    submissions.forEach(sub => {
      const school = schoolMap.get(sub.schoolId);
      if (!school || !sub.professionals?.allocations) return;

      sub.professionals.allocations.forEach(alloc => {
        const turnText = alloc.turn === 'morning' ? 'Manhã' : alloc.turn === 'afternoon' ? 'Tarde' : alloc.turn === 'night' ? 'Noite' : 'Integral';

        const currentTeachers = alloc.teachers || [];
        const projectedTeachers = alloc.teachers2026 || [];
        const maxEntries = Math.max(currentTeachers.length, projectedTeachers.length);

        if (maxEntries === 0) {
            data.push({
                schoolName: school.name,
                classroomName: alloc.classroomName,
                grade: alloc.grade,
                turn: turnText,
            });
        } else {
            for (let i = 0; i < maxEntries; i++) {
                 data.push({
                    schoolName: school.name,
                    classroomName: alloc.classroomName,
                    grade: alloc.grade,
                    turn: turnText,
                    current: currentTeachers[i],
                    projected: projectedTeachers[i],
                });
            }
        }
      });
    });

    return data;
  }, [submissions, schoolMap, professionalMap]);

  if (submissions.length === 0) {
      return (
          <div className="p-6 text-center text-muted-foreground">
              Nenhuma submissão encontrada com os filtros aplicados.
          </div>
      )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Escola</TableHead>
          <TableHead>Sala</TableHead>
          <TableHead>Turma/Turno</TableHead>
          <TableHead>Professor(a) Atual</TableHead>
          <TableHead>Matrícula (Atual)</TableHead>
          <TableHead>Turno (Atual)</TableHead>
          <TableHead>Vínculo (Atual)</TableHead>
          <TableHead>C.H (Atual)</TableHead>
          <TableHead className="border-r">Projeção 2026</TableHead>
          <TableHead>Matrícula (2026)</TableHead>
          <TableHead>Turno (2026)</TableHead>
          <TableHead>Vínculo (2026)</TableHead>
          <TableHead>C.H (2026)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projectionData.map((row, index) => (
          <TableRow key={index}>
            <TableCell>{row.schoolName}</TableCell>
            <TableCell>{row.classroomName}</TableCell>
            <TableCell>{`${row.grade} (${row.turn})`}</TableCell>
            <TableCell>{row.current ? professionalMap.get(row.current.professionalId || '') || 'N/A' : 'N/A'}</TableCell>
            <TableCell>{row.current?.matricula || 'N/A'}</TableCell>
            <TableCell>{row.current?.turn || 'N/A'}</TableCell>
            <TableCell>{row.current?.contractType || 'N/A'}</TableCell>
            <TableCell>{row.current?.workload || 'N/A'}</TableCell>
            <TableCell className="border-r">{row.projected ? professionalMap.get(row.projected.professionalId || '') || 'N/A' : 'N/A'}</TableCell>
            <TableCell>{row.projected?.matricula || 'N/A'}</TableCell>
            <TableCell>{row.projected?.turn || 'N/A'}</TableCell>
            <TableCell>{row.projected?.contractType || 'N/A'}</TableCell>
            <TableCell>{row.projected?.workload || 'N/A'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
