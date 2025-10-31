
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
import type { SchoolCensusSubmission, School } from "@/types";

interface ClassProjectionsTableProps {
  submissions: SchoolCensusSubmission[];
  schoolMap: Map<string, School>;
}

export function ClassProjectionsTable({ submissions, schoolMap }: ClassProjectionsTableProps) {

  const projectionData = React.useMemo(() => {
    const data: {
      schoolName: string;
      classroomName: string;
      currentGrade: string;
      currentStudents: number;
      projectedGrade2026: string;
      hasLinkedTransfer?: boolean;
      linkedTransferSchoolId?: string;
    }[] = [];

    submissions.forEach(sub => {
      const school = schoolMap.get(sub.schoolId);
      if (!school || !sub.infrastructure?.classrooms) return;

      sub.infrastructure.classrooms.forEach(room => {
        const commonData = {
          schoolName: school.name,
          classroomName: room.name,
          hasLinkedTransfer: room.hasLinkedTransfer,
          linkedTransferSchoolId: room.linkedTransferSchoolId,
        };

        if (room.occupationType === 'integral') {
          if (room.gradeIntegral) {
            data.push({
              ...commonData,
              currentGrade: `${room.gradeIntegral} (Integral)`,
              currentStudents: room.studentsIntegral || 0,
              projectedGrade2026: room.gradeProjection2026Integral || 'N/A',
            });
          }
        } else {
          if (room.gradeMorning) {
            data.push({
              ...commonData,
              currentGrade: `${room.gradeMorning} (Manhã)`,
              currentStudents: room.studentsMorning || 0,
              projectedGrade2026: room.gradeProjection2026Morning || 'N/A',
            });
          }
          if (room.gradeAfternoon) {
             data.push({
              ...commonData,
              currentGrade: `${room.gradeAfternoon} (Tarde)`,
              currentStudents: room.studentsAfternoon || 0,
              projectedGrade2026: room.gradeProjection2026Afternoon || 'N/A',
            });
          }
          if (room.gradeNight) {
             data.push({
              ...commonData,
              currentGrade: `${room.gradeNight} (Noite)`,
              currentStudents: room.studentsNight || 0,
              projectedGrade2026: room.gradeProjection2026Night || 'N/A',
            });
          }
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
          <TableHead>Unidade Fornecedora</TableHead>
          <TableHead>Sala</TableHead>
          <TableHead>Turma/Turno Atual</TableHead>
          <TableHead>Alunos Atuais</TableHead>
          <TableHead>Projeção Turma 2026</TableHead>
          <TableHead>Transf. Casada</TableHead>
          <TableHead>Unidade Receptora</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projectionData.map((row, index) => (
          <TableRow key={index}>
            <TableCell>{row.schoolName}</TableCell>
            <TableCell>{row.classroomName}</TableCell>
            <TableCell>{row.currentGrade}</TableCell>
            <TableCell>{row.currentStudents}</TableCell>
            <TableCell>{row.projectedGrade2026}</TableCell>
            <TableCell>{row.hasLinkedTransfer ? 'Sim' : 'Não'}</TableCell>
            <TableCell>
              {row.hasLinkedTransfer && row.linkedTransferSchoolId
                ? schoolMap.get(row.linkedTransferSchoolId)?.name || 'N/A'
                : 'N/A'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
