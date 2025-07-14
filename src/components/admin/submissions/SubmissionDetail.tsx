import type { SchoolCensusSubmission, School } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SubmissionDetailProps {
  submission: SchoolCensusSubmission;
  school: School | null;
}

export function SubmissionDetail({ submission, school }: SubmissionDetailProps) {
  return (
    <div className="space-y-6">
        <div>
            <Button variant="outline" asChild>
                <Link href="/admin/dashboard">← Voltar ao Dashboard</Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight font-headline mt-4">Detalhes da Submissão</h1>
            <p className="text-muted-foreground">
                Enviado em: {format(submission.submittedAt, "dd 'de' MMMM 'de' yyyy, 'às' HH:mm", { locale: ptBR })}
            </p>
        </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Identificação da Escola</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h3 className="font-semibold">Nome da Escola</h3>
                    <p>{school?.name || 'Não informado'}</p>
                </div>
                 <div>
                    <h3 className="font-semibold">Código INEP</h3>
                    <p>{school?.inep || 'Não informado'}</p>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Turmas</CardTitle>
          <CardDescription>Total de {submission.classrooms.length} turmas com {submission.classrooms.reduce((acc, c) => acc + c.studentCount, 0)} alunos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome da Turma</TableHead>
                <TableHead className="text-right">Nº de Alunos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submission.classrooms.map((classroom) => (
                <TableRow key={classroom.id}>
                  <TableCell>{classroom.name}</TableCell>
                  <TableCell className="text-right">{classroom.studentCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Modalidades de Ensino</CardTitle>
           <CardDescription>Total de {submission.teachingModalities.length} modalidades com {submission.teachingModalities.reduce((acc, c) => acc + c.studentCount, 0)} alunos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome da Modalidade</TableHead>
                <TableHead className="text-right">Nº de Alunos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submission.teachingModalities.map((modality) => (
                <TableRow key={modality.id}>
                  <TableCell>{modality.name}</TableCell>
                  <TableCell className="text-right">{modality.studentCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recursos Tecnológicos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submission.technologies.map((tech) => (
              <div key={tech.id} className="flex items-center gap-2">
                {tech.hasIt ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-destructive" />}
                <span>{tech.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
