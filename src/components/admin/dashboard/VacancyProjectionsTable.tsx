
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

interface VacancyDetail {
    schoolId: string;
    classroomName: string;
    projectedGrade: string;
    turn: string;
    capacity: number;
    veterans: number;
    newcomers: number;
    total: number;
}

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
          <TableHead className="text-right">Capacidade</TableHead>
          <TableHead className="text-right">Veteranos</TableHead>
          <TableHead className="text-right">Novatos</TableHead>
          <TableHead className="text-right">Total Alunos (2026)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vacancyData.map((row, index) => (
          <TableRow key={index}>
            <TableCell>{schoolMap.get(row.schoolId)?.name || 'N/A'}</TableCell>
            <TableCell>{row.classroomName}</TableCell>
            <TableCell>{`${row.projectedGrade} (${row.turn})`}</TableCell>
            <TableCell className="text-right">{row.capacity}</TableCell>
            <TableCell className="text-right">{row.veterans}</TableCell>
            <TableCell className="text-right">{row.newcomers}</TableCell>
            <TableCell className="text-right font-bold">{row.total}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
