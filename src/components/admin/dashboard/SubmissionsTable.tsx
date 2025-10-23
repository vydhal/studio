
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
import type { SchoolCensusSubmission, School, FormSectionConfig } from "@/types";
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
import { Progress } from '@/components/ui/progress';
import { useAppSettings } from '@/context/AppContext';
import { Timestamp } from 'firebase/firestore';


interface SubmissionsTableProps {
  submissions: SchoolCensusSubmission[];
  schoolMap: Map<string, School>;
}

const StatusIcon = ({ status }: { status?: 'completed' | 'pending' }) => {
    if (status === 'completed') {
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <Circle className="h-5 w-5 text-yellow-500" />;
}

const getOverallStatus = (submission: SchoolCensusSubmission, totalSections: number): { label: string; variant: "default" | "secondary" | "destructive" | "outline" | null | undefined; completedCount: number } => {
    const sections = [submission.general, submission.infrastructure, submission.professionals, submission.technology, submission.cultural, submission.maintenance];
    const completedCount = sections.filter(s => s?.status === 'completed').length;
    
    if (completedCount >= totalSections) { // Use >= in case totalSections is miscalculated
        return { label: 'Completo', variant: 'default', completedCount };
    }
    if (completedCount === 0) {
        return { label: 'Pendente', variant: 'destructive', completedCount };
    }
    return { label: 'Em Andamento', variant: 'secondary', completedCount };
}

const SubmissionStatusModal = ({ submission, school, overallStatus, totalSections }: { submission: SchoolCensusSubmission, school: School | undefined, overallStatus: ReturnType<typeof getOverallStatus>, totalSections: number }) => {
    const sections = [
        { name: 'Dados Gerais', status: submission.general?.status },
        { name: 'Infraestrutura', status: submission.infrastructure?.status },
        { name: 'Profissionais', status: submission.professionals?.status },
        { name: 'Tecnologia', status: submission.technology?.status },
        { name: 'Cultural', status: submission.cultural?.status },
        { name: 'Manutenção', status: submission.maintenance?.status },
    ];

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="w-full text-left">
                    <div className="flex items-center gap-2">
                        <Progress value={(overallStatus.completedCount / totalSections) * 100} className="w-24 h-2" />
                        <span className="text-xs text-muted-foreground">{overallStatus.completedCount} de {totalSections}</span>
                    </div>
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Status do Censo - {school?.name}</DialogTitle>
                     <div className="flex items-center gap-4 pt-2">
                        <Progress value={(overallStatus.completedCount / totalSections) * 100} className="w-full" />
                        <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">{overallStatus.completedCount} de {totalSections} preenchidas</span>
                    </div>
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


export function SubmissionsTable({ submissions, schoolMap }: SubmissionsTableProps) {
  const { settings } = useAppSettings();

  const getFormattedDate = (dateValue: any): string => {
    if (!dateValue) return 'N/A';

    try {
        let date: Date;
        if (dateValue instanceof Timestamp) {
            date = dateValue.toDate();
        } else if (dateValue instanceof Date) {
            date = dateValue;
        } else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
            date = new Date(dateValue);
        } else {
             return 'N/A';
        }

        if (isNaN(date.getTime())) {
            return 'N/A';
        }

        return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch (error) {
        return 'N/A';
    }
  }


  if (submissions.length === 0) {
      return (
          <div className="p-6 text-center text-muted-foreground">
              Nenhuma submissão encontrada. Preencha o formulário para uma escola para começar.
          </div>
      )
  }
  
  // We now have 6 sections to track
  const totalSections = 6; 

  return (
    <Table>
    <TableHeader>
        <TableRow>
        <TableHead>Escola</TableHead>
        <TableHead className="hidden md:table-cell">INEP</TableHead>
        <TableHead className="hidden md:table-cell">Última Atualização</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="hidden md:table-cell">Progresso</TableHead>
        <TableHead>
            <span className="sr-only">Ações</span>
        </TableHead>
        </TableRow>
    </TableHeader>
    <TableBody>
        {submissions.map((submission) => {
        const school = schoolMap.get(submission.schoolId);
        const overallStatus = getOverallStatus(submission, totalSections);
        return (
            <TableRow key={submission.id}>
            <TableCell className="font-medium">{school?.name || 'Escola não encontrada'}</TableCell>
            <TableCell className="hidden md:table-cell">{school?.inep || 'N/A'}</TableCell>
            <TableCell className="hidden md:table-cell">{getFormattedDate(submission.submittedAt)}</TableCell>
            <TableCell>
                <Badge variant={overallStatus.variant}>{overallStatus.label}</Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">
                 <SubmissionStatusModal submission={submission} school={school} overallStatus={overallStatus} totalSections={totalSections} />
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
                         <Link href={`/admin/submissions/${submission.schoolId}`}>Ver Detalhes</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/census?schoolId=${submission.schoolId}`}>Editar Formulário</Link>
                      </DropdownMenuItem>
                       <DropdownMenuItem disabled>Exportar PDF</DropdownMenuItem>
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

    