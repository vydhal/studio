
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
import type { SchoolCensusSubmission, School, Professional } from "@/types";

interface TeacherProjectionsTableProps {
  submissions: SchoolCensusSubmission[];
  schoolMap: Map<string, School>;
  professionalMap: Map<string, string>;
}

export function TeacherProjectionsTable({ submissions, schoolMap, professionalMap }: TeacherProjectionsTableProps) {

  const projectionData = React.useMemo(() => {
    const data: {
      schoolName: string;
      classroomName: string;
      grade: string;
      turn: string;
      currentTeacher?: string;
      projectedTeacher?: string;
    }[] = [];

    submissions.forEach(sub => {
      const school = schoolMap.get(sub.schoolId);
      if (!school || !sub.professionals?.allocations) return;

      sub.professionals.allocations.forEach(alloc => {
        const turnText = alloc.turn === 'morning' ? 'Manhã' : alloc.turn === 'afternoon' ? 'Tarde' : alloc.turn === 'night' ? 'Noite' : 'Integral';
        const gradeWithTurn = `${alloc.grade} (${turnText})`;

        const currentTeachers = alloc.teachers?.map(t => professionalMap.get(t.professionalId || '') || 'Não alocado') || [];
        const projectedTeachers = alloc.teachers2026?.map(t => professionalMap.get(t.professionalId || '') || 'Não alocado') || [];

        const maxEntries = Math.max(currentTeachers.length, projectedTeachers.length);

        if (maxEntries === 0) {
            data.push({
                schoolName: school.name,
                classroomName: alloc.classroomName,
                grade: alloc.grade,
                turn: turnText,
                currentTeacher: 'N/A',
                projectedTeacher: 'N/A',
            });
        } else {
            for (let i = 0; i < maxEntries; i++) {
                 data.push({
                    schoolName: school.name,
                    classroomName: alloc.classroomName,
                    grade: alloc.grade,
                    turn: turnText,
                    currentTeacher: currentTeachers[i] || '',
                    projectedTeacher: projectedTeachers[i] || '',
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
          <TableHead>Projeção 2026</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projectionData.map((row, index) => (
          <TableRow key={index}>
            <TableCell>{row.schoolName}</TableCell>
            <TableCell>{row.classroomName}</TableCell>
            <TableCell>{`${row.grade} (${row.turn})`}</TableCell>
            <TableCell>{row.currentTeacher}</TableCell>
            <TableCell>{row.projectedTeacher}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
