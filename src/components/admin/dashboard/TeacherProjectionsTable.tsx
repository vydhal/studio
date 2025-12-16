
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MessageSquare } from 'lucide-react';

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
        
        const projectedTeachers = alloc.teachers2026 || [];
        
        if (projectedTeachers.length === 0) {
            // Add a row even if there are no projected teachers, to show the class
            data.push({
                schoolName: school.name,
                classroomName: alloc.classroomName,
                grade: alloc.grade,
                turn: turnText,
            });
        } else {
            projectedTeachers.forEach(projTeacher => {
                 data.push({
                    schoolName: school.name,
                    classroomName: alloc.classroomName,
                    grade: alloc.grade,
                    turn: turnText,
                    projected: projTeacher,
                });
            });
        }
      });
    });

    return data;
  }, [submissions, schoolMap]);

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
          <TableHead>Série/Turno</TableHead>
          <TableHead>Professor(a) (2026)</TableHead>
          <TableHead>Matrícula (2026)</TableHead>
          <TableHead>Turma (2026)</TableHead>
          <TableHead>Turno (2026)</TableHead>
          <TableHead>Vínculo (2026)</TableHead>
          <TableHead>C.H (2026)</TableHead>
          <TableHead>Situação (2026)</TableHead>
          <TableHead>Anotações (2026)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projectionData.map((row, index) => (
          <TableRow key={index}>
            <TableCell>{row.schoolName}</TableCell>
            <TableCell>{row.classroomName}</TableCell>
            <TableCell>{`${row.grade}${row.projected?.class ? ` ${row.projected.class}` : ''} (${row.turn})`}</TableCell>
            <TableCell>{row.projected ? professionalMap.get(row.projected.professionalId || '') || 'N/A' : 'N/A'}</TableCell>
            <TableCell>{row.projected?.matricula || 'N/A'}</TableCell>
            <TableCell>{row.projected?.class || 'N/A'}</TableCell>
            <TableCell>{row.projected?.turn || 'N/A'}</TableCell>
            <TableCell>{row.projected?.contractType || 'N/A'}</TableCell>
            <TableCell>{row.projected?.workload || 'N/A'}</TableCell>
            <TableCell>{row.projected?.situation || 'N/A'}</TableCell>
            <TableCell>
              {row.projected?.annotations ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs whitespace-pre-wrap">{row.projected.annotations}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                'N/A'
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
