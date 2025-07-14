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
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface SubmissionsTableProps {
  submissions: SchoolCensusSubmission[];
  schoolMap: Map<string, School>;
}

export function SubmissionsTable({ submissions, schoolMap }: SubmissionsTableProps) {
  if (submissions.length === 0) {
      return (
          <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                  Nenhuma submissão encontrada para o filtro atual.
              </CardContent>
          </Card>
      )
  }
  
  return (
    <Card>
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Escola</TableHead>
            <TableHead>INEP</TableHead>
            <TableHead className="text-right">Total de Alunos</TableHead>
            <TableHead>Data de Envio</TableHead>
            <TableHead></TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {submissions.map((submission) => {
            const school = schoolMap.get(submission.schoolId);
            const totalStudents = submission.classrooms.reduce((acc, curr) => acc + curr.studentCount, 0);
            return (
                <TableRow key={submission.id}>
                <TableCell className="font-medium">{school?.name || 'Escola não encontrada'}</TableCell>
                <TableCell>{school?.inep || 'N/A'}</TableCell>
                <TableCell className="text-right">{totalStudents}</TableCell>
                <TableCell>{format(submission.submittedAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}</TableCell>
                <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/submissions/${submission.id}`}>
                        Ver Detalhes <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    </Button>
                </TableCell>
                </TableRow>
            );
            })}
        </TableBody>
        </Table>
    </Card>
  );
}
