

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
import { Button } from "@/components/ui/button";
import type { SchoolCensusSubmission, School, FormSectionConfig } from "@/types";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { ArrowRight, CheckCircle, Circle, MoreHorizontal, AlertTriangle, Trash2, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { useAppSettings } from '@/context/AppContext';
import { Timestamp } from 'firebase/firestore';


interface SubmissionsTableProps {
  schools: School[];
  submissionMap: Map<string, SchoolCensusSubmission>;
  onDelete: (schoolId: string) => void;
}

const StatusIcon = ({ status }: { status?: 'completed' | 'pending' }) => {
    if (status === 'completed') {
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <Circle className="h-5 w-5 text-yellow-500" />;
}

const getSectionStatus = (submission: SchoolCensusSubmission, sectionId: keyof SchoolCensusSubmission | 'professionals' | 'infra_167') => {
    // Handle dynamic sections stored in dynamicData
    if (!['infrastructure', 'professionals', 'infra_167'].includes(sectionId)) {
        const dynamicSectionData = submission.dynamicData?.[sectionId as string];
        if (dynamicSectionData && Object.values(dynamicSectionData).some(v => v !== '' && v !== false && v !== null && v !== undefined)) {
            return 'completed';
        }
    }

    // Handle specific static sections
    switch(sectionId) {
        case 'infrastructure':
        case 'infra_167': // Legacy ID check
            return submission.infrastructure?.classrooms && submission.infrastructure.classrooms.length > 0
                ? 'completed'
                : 'pending';
        case 'professionals':
            // This check might need refinement based on actual data structure for 'professionals'
            return submission.professionals?.allocations && submission.professionals.allocations.length > 0
                ? 'completed'
                : 'pending';
        default:
            return 'pending';
    }
};


const getOverallStatus = (submission: SchoolCensusSubmission | undefined, formConfig: FormSectionConfig[]): { label: string; variant: "default" | "secondary" | "destructive" | "outline" | null | undefined; completedCount: number, totalSections: number } => {
    if (!submission) {
        return { label: 'Não Iniciado', variant: 'destructive', completedCount: 0, totalSections: formConfig.length };
    }
    
    const totalSections = formConfig.length;
    if (totalSections === 0) {
        return { label: 'N/A', variant: 'outline', completedCount: 0, totalSections: 0 };
    }

    let completedCount = 0;
    formConfig.forEach(section => {
        if(getSectionStatus(submission, section.id) === 'completed') {
            completedCount++;
        }
    })
    
    if (completedCount >= totalSections) {
        return { label: 'Completo', variant: 'default', completedCount, totalSections };
    }
    if (completedCount === 0) {
        return { label: 'Pendente', variant: 'secondary', completedCount, totalSections };
    }
    return { label: 'Em Andamento', variant: 'secondary', completedCount, totalSections };
}


const SubmissionStatusModal = ({ submission, school, overallStatus, formConfig }: { submission: SchoolCensusSubmission, school: School, overallStatus: ReturnType<typeof getOverallStatus>, formConfig: FormSectionConfig[] }) => {
    const { totalSections, completedCount } = overallStatus;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="w-full text-left">
                    <div className="flex items-center gap-2">
                        <Progress value={(completedCount / (totalSections || 1)) * 100} className="w-24 h-2" />
                        <span className="text-xs text-muted-foreground">{completedCount} de {totalSections}</span>
                    </div>
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Status do Censo - {school?.name}</DialogTitle>
                     <div className="flex items-center gap-4 pt-2">
                        <Progress value={(completedCount / (totalSections || 1)) * 100} className="w-full" />
                        <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">{completedCount} de {totalSections} preenchidas</span>
                    </div>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {formConfig.map(section => {
                        const status = getSectionStatus(submission, section.id)
                        return (
                            <div key={section.id} className="flex items-center justify-between">
                                <span className="text-sm font-medium">{section.name}</span>
                                <div className="flex items-center gap-2">
                                    <StatusIcon status={status} />
                                    <span className={`text-sm ${status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {status === 'completed' ? 'Preenchido' : 'Pendente'}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </DialogContent>
        </Dialog>
    )
}


export function SubmissionsTable({ schools, submissionMap, onDelete }: SubmissionsTableProps) {
  const { settings } = useAppSettings();
  const formConfig = settings?.formConfig || [];


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
        } else if (typeof dateValue === 'object' && dateValue.seconds) { // Handle serialized Timestamp
            date = new Timestamp(dateValue.seconds, dateValue.nanoseconds).toDate();
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


  if (schools.length === 0) {
      return (
          <div className="p-6 text-center text-muted-foreground">
              Nenhuma escola cadastrada no sistema.
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
        <TableHead className="hidden md:table-cell">Progresso</TableHead>
        <TableHead>
            <span className="sr-only">Ações</span>
        </TableHead>
        </TableRow>
    </TableHeader>
    <TableBody>
        {schools.map((school) => {
            const submission = submissionMap.get(school.id);
            const overallStatus = getOverallStatus(submission, formConfig);
            return (
                <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{school.inep}</TableCell>
                    <TableCell className="hidden md:table-cell">{submission ? getFormattedDate(submission.submittedAt) : 'N/A'}</TableCell>
                    <TableCell>
                        <Badge variant={overallStatus.variant}>{overallStatus.label}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        {submission ? (
                            <SubmissionStatusModal submission={submission} school={school} overallStatus={overallStatus} formConfig={formConfig} />
                        ) : (
                            <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                    </TableCell>
                    <TableCell>
                        {submission ? (
                            <AlertDialog>
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
                                        <DropdownMenuSeparator />
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Excluir
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle />Confirmar Exclusão</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta ação é permanente e não pode ser desfeita. Todos os dados do censo para a escola <strong>{school.name}</strong> serão apagados.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive hover:bg-destructive/90"
                                            onClick={() => onDelete(submission.schoolId)}
                                        >
                                            Excluir Submissão
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        ) : (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/census?schoolId=${school.id}`}>
                                    <Edit className="mr-2 h-3 w-3" />
                                    Iniciar Preenchimento
                                </Link>
                            </Button>
                        )}
                    </TableCell>
                </TableRow>
            );
        })}
    </TableBody>
    </Table>
  );
}
