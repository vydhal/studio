
"use client";

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { SchoolCensusSubmission, School } from "@/types";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Circle, MoreHorizontal, File, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


interface SubmissionsTableProps {
  submissions: SchoolCensusSubmission[];
  schoolMap: Map<string, School>;
}

const StatusIcon = ({ status }: { status: 'completed' | 'pending' }) => {
    if (status === 'completed') {
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <Circle className="h-5 w-5 text-yellow-500" />;
}

const getOverallStatus = (submission: SchoolCensusSubmission): { label: string, variant: "default" | "secondary" | "destructive" | "outline" | null | undefined } => {
    const sections = [submission.general, submission.infrastructure, submission.technology, submission.cultural, submission.maintenance];
    const completedCount = sections.filter(s => s.status === 'completed').length;
    
    if (completedCount === sections.length) {
        return { label: 'Completo', variant: 'default' };
    }
    if (completedCount === 0) {
        return { label: 'Pendente', variant: 'destructive' };
    }
    return { label: 'Em Andamento', variant: 'secondary' };
}

const SubmissionStatusModal = ({ submission }: { submission: SchoolCensusSubmission }) => {
    const school = getMockSchool(submission.schoolId);
    
    const sections = [
        { name: 'Dados Gerais', status: submission.general.status },
        { name: 'Infraestrutura', status: submission.infrastructure.status },
        { name: 'Tecnologia', status: submission.technology.status },
        { name: 'Cultural', status: submission.cultural.status },
        { name: 'Manutenção', status: submission.maintenance.status },
    ];

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">Ver Status</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Status do Censo - {school?.name}</DialogTitle>
                    <DialogDescription>
                        Status de preenchimento de cada seção do formulário.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {sections.map(section => (
                        <div key={section.name} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{section.name}</span>
                            <div className="flex items-center gap-2">
                                <StatusIcon status={section.status} />
                                <span className={`text-sm ${section.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {section.status === 'completed' ? 'Preenchido' : 'Pendente'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}

// Helper to get mock school by ID
const getMockSchool = (id: string): School | null => {
    const mockSchools: { [key: string]: School } = {
        'school1': { id: 'school1', name: 'Escola Municipal Exemplo 1', inep: '12345678' },
        'school2': { id: 'school2', name: 'Escola Estadual Teste 2', inep: '87654321' },
    };
    return mockSchools[id] || null;
}


export function SubmissionsTable({ submissions, schoolMap }: SubmissionsTableProps) {
  if (submissions.length === 0) {
      return (
          <div className="p-6 text-center text-muted-foreground">
              Nenhuma submissão encontrada para o filtro atual.
          </div>
      )
  }
  
  return (
    <Table>
    <TableHeader>
        <TableRow>
        <TableHead>Escola</TableHead>
        <TableHead className="hidden md:table-cell">INEP</TableHead>
        <TableHead className="hidden md:table-cell">Última Atualização</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="hidden md:table-cell">Status Detalhado</TableHead>
        <TableHead>
            <span className="sr-only">Ações</span>
        </TableHead>
        </TableRow>
    </TableHeader>
    <TableBody>
        {submissions.map((submission) => {
        const school = schoolMap.get(submission.schoolId);
        const overallStatus = getOverallStatus(submission);
        return (
            <TableRow key={submission.id}>
            <TableCell className="font-medium">{school?.name || 'Escola não encontrada'}</TableCell>
            <TableCell className="hidden md:table-cell">{school?.inep || 'N/A'}</TableCell>
            <TableCell className="hidden md:table-cell">{format(submission.submittedAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}</TableCell>
            <TableCell>
                <Badge variant={overallStatus.variant}>{overallStatus.label}</Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">
                 <SubmissionStatusModal submission={submission} />
            </TableCell>
            <TableCell>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                         <Link href={`/admin/submissions/${submission.id}`}>Ver Detalhes</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/census?schoolId=${submission.schoolId}`}>Editar Formulário</Link>
                      </DropdownMenuItem>
                       <DropdownMenuItem>Exportar PDF</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
            </TableCell>
            </TableRow>
        );
        })}
    </TableBody>
    </Table>
  );
}
