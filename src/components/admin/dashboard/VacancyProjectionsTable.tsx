
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
import type { School } from "@/types";
import type { VacancyDetail } from './MetricsCards';


interface VacancyProjectionsTableProps {
  vacancyData: VacancyDetail[];
  schoolMap: Map<string, School>;
}

export function VacancyProjectionsTable({ vacancyData, schoolMap }: VacancyProjectionsTableProps) {
  
  if (vacancyData.length === 0) {
      return (
          <div className="p-6 text-center text-muted-foreground">
              Nenhuma projeção de vagas encontrada com os filtros aplicados.
          </div>
      )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Unidade</TableHead>
          <TableHead>Sala</TableHead>
          <TableHead>Turma 2026</TableHead>
          <TableHead className="text-center">Capacidade</TableHead>
          <TableHead className="text-center">Veteranos</TableHead>
          <TableHead className="text-center">Novatos</TableHead>
          <TableHead className="text-center border-r">Total Alunos (2026)</TableHead>
          <TableHead>Turma 2025</TableHead>
          <TableHead className="text-center">Matriculados 2025</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vacancyData.map((row, index) => (
          <TableRow key={index}>
            <TableCell>{schoolMap.get(row.schoolId)?.name || 'N/A'}</TableCell>
            <TableCell>{row.classroomName}</TableCell>
            <TableCell>{`${row.projectedGrade} (${row.turn})`}</TableCell>
            <TableCell className="text-center">{row.capacity}</TableCell>
            <TableCell className="text-center">{row.veterans}</TableCell>
            <TableCell className="text-center">{row.newcomers}</TableCell>
            <TableCell className="text-center font-bold border-r">{row.total}</TableCell>
            <TableCell>{row.grade2025}</TableCell>
            <TableCell className="text-center">{row.students2025}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
