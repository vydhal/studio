import type { SchoolCensusSubmission, School, Classroom } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Users, Tv, Wind, Zap, Armchair, Wifi, Snowflake } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface SubmissionDetailProps {
  submission: SchoolCensusSubmission;
  school: School | null;
}

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number }) => (
    <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-md">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-semibold">{value}</p>
        </div>
    </div>
)

const ClassroomDetails = ({ classroom }: { classroom: Classroom }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <InfoItem icon={Users} label="Capacidade" value={classroom.studentCapacity} />
        <InfoItem icon={Armchair} label="Cadeiras" value={classroom.chairCount} />
        <InfoItem icon={Zap} label="Tomadas" value={classroom.outlets} />
        <InfoItem icon={Tv} label="TVs" value={classroom.tvCount} />
        <InfoItem icon={Wind} label="Ventiladores" value={classroom.fanCount} />
        <div className="flex items-center gap-2">
            {classroom.hasInternet ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-destructive" />}
            <span className="flex items-center gap-1"><Wifi className="h-4 w-4 text-muted-foreground" /> Internet</span>
        </div>
        <div className="flex items-center gap-2">
            {classroom.hasAirConditioning ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-destructive" />}
            <span className="flex items-center gap-1"><Snowflake className="h-4 w-4 text-muted-foreground" /> Ar Cond.</span>
        </div>
    </div>
)


export function SubmissionDetail({ submission, school }: SubmissionDetailProps) {
  const totalStudentsInClassrooms = submission.classrooms.reduce((acc, c) => acc + c.studentCapacity, 0);

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
          <CardTitle>Salas de Aula</CardTitle>
          <CardDescription>Total de {submission.classrooms.length} salas de aula.</CardDescription>
        </CardHeader>
        <CardContent>
           <Accordion type="single" collapsible className="w-full">
              {submission.classrooms.map((classroom) => (
                <AccordionItem value={classroom.id} key={classroom.id}>
                    <AccordionTrigger className="font-semibold">{classroom.name}</AccordionTrigger>
                    <AccordionContent>
                        <ClassroomDetails classroom={classroom} />
                    </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
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
