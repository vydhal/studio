
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
      linkedTransferSchoolIds?: string[];
    }[] = [];

    submissions.forEach(sub => {
      const school = schoolMap.get(sub.schoolId);
      if (!school || !sub.infrastructure?.classrooms) return;

      sub.infrastructure.classrooms.forEach(room => {

        if (room.occupationType === 'integral') {
          if (room.gradeIntegral) {
            data.push({
              schoolName: school.name,
              classroomName: room.name,
              currentGrade: `${room.gradeIntegral} (Integral)`,
              currentStudents: room.studentsIntegral || 0,
              projectedGrade2026: room.gradeProjection2026Integral || 'N/A',
              hasLinkedTransfer: room.hasLinkedTransferIntegral,
              linkedTransferSchoolIds: room.linkedTransferSchoolIdsIntegral,
            });
          }
        } else {
          if (room.gradeMorning) {
            data.push({
              schoolName: school.name,
              classroomName: room.name,
              currentGrade: `${room.gradeMorning} (Manhã)`,
              currentStudents: room.studentsMorning || 0,
              projectedGrade2026: room.gradeProjection2026Morning || 'N/A',
              hasLinkedTransfer: room.hasLinkedTransferMorning,
              linkedTransferSchoolIds: room.linkedTransferSchoolIdsMorning,
            });
          }
          if (room.gradeAfternoon) {
             data.push({
              schoolName: school.name,
              classroomName: room.name,
              currentGrade: `${room.gradeAfternoon} (Tarde)`,
              currentStudents: room.studentsAfternoon || 0,
              projectedGrade2026: room.gradeProjection2026Afternoon || 'N/A',
              hasLinkedTransfer: room.hasLinkedTransferAfternoon,
              linkedTransferSchoolIds: room.linkedTransferSchoolIdsAfternoon,
            });
          }
          if (room.gradeNight) {
             data.push({
              schoolName: school.name,
              classroomName: room.name,
              currentGrade: `${room.gradeNight} (Noite)`,
              currentStudents: room.studentsNight || 0,
              projectedGrade2026: room.gradeProjection2026Night || 'N/A',
              hasLinkedTransfer: room.hasLinkedTransferNight,
              linkedTransferSchoolIds: room.linkedTransferSchoolIdsNight,
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
          <TableHead className="text-center">Alunos Atuais</TableHead>
          <TableHead>Transf. Casada</TableHead>
          <TableHead className="border-r">Unidade Receptora</TableHead>
          <TableHead>Projeção Turma 2026</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projectionData.map((row, index) => (
          <TableRow key={index}>
            <TableCell>{row.schoolName}</TableCell>
            <TableCell>{row.classroomName}</TableCell>
            <TableCell>{row.currentGrade}</TableCell>
            <TableCell className="text-center">{row.currentStudents}</TableCell>
            <TableCell>{row.hasLinkedTransfer ? 'Sim' : 'Não'}</TableCell>
            <TableCell className="border-r">
              {row.hasLinkedTransfer && row.linkedTransferSchoolIds && row.linkedTransferSchoolIds.length > 0
                ? row.linkedTransferSchoolIds.map(id => schoolMap.get(id)?.name || 'N/A').join(', ')
                : 'N/A'}
            </TableCell>
            <TableCell>{row.projectedGrade2026}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
