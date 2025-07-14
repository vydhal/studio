"use client";

import { useState, useEffect } from "react";
import type { SchoolCensusSubmission, School, Classroom, TeachingModality, TechnologyResource, FormSectionConfig } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Users, Tv, Wind, Zap, Armchair, Wifi, Snowflake, Check, Bot, Laptop, Printer, Router, AlertTriangle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

interface SubmissionDetailProps {
  schoolId: string;
}

const SCHOOLS_STORAGE_KEY = 'schoolList';
const SUBMISSIONS_STORAGE_KEY = 'schoolCensusSubmissions';
const FORM_CONFIG_STORAGE_KEY = 'censusFormConfig';


const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number | React.ReactNode }) => (
    <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-md">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-semibold">{value || 'N/A'}</p>
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

const techIcons: { [key: string]: React.ElementType } = {
  'Kits de Robótica': Bot,
  'Chromebooks': Laptop,
  'Notebooks': Laptop,
  'Modems': Router,
  'Impressoras': Printer,
  'Modems com Defeito': Router,
};


export function SubmissionDetail({ schoolId }: SubmissionDetailProps) {
    const [submission, setSubmission] = useState<SchoolCensusSubmission | null>(null);
    const [school, setSchool] = useState<School | null>(null);
    const [formConfig, setFormConfig] = useState<FormSectionConfig[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const allSubmissionsText = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
            if(allSubmissionsText) {
                const allSubmissions = JSON.parse(allSubmissionsText);
                setSubmission(allSubmissions[schoolId] || null);
            }

            const allSchoolsText = localStorage.getItem(SCHOOLS_STORAGE_KEY);
            if(allSchoolsText) {
                const allSchools: School[] = JSON.parse(allSchoolsText);
                setSchool(allSchools.find(s => s.id === schoolId) || null);
            }
            
            const formConfigText = localStorage.getItem(FORM_CONFIG_STORAGE_KEY);
            if(formConfigText) {
                setFormConfig(JSON.parse(formConfigText));
            }

        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        } finally {
            setLoading(false);
        }

    }, [schoolId])

  if (loading) {
    return (
        <div className="space-y-4">
             <Skeleton className="h-10 w-48" />
             <Skeleton className="h-12 w-full" />
             <Skeleton className="h-24 w-full" />
             <Skeleton className="h-48 w-full" />
             <Skeleton className="h-48 w-full" />
        </div>
    )
  }

  if (!submission || !school) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle/>
                        Submissão não encontrada
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Não foi encontrada nenhuma submissão para a escola com o ID solicitado. A escola pode não ter iniciado o preenchimento do censo ainda.</p>
                     <Button asChild variant="link" className="px-0">
                        <Link href="/admin/dashboard">Voltar para o Dashboard</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

  const getSectionFromConfig = (sectionId: string) => formConfig.find(s => s.id === sectionId);
  const getFieldFromConfig = (sectionId: string, fieldId: string) => 
      getSectionFromConfig(sectionId)?.fields.find(f => f.id === fieldId);

  return (
    <div className="space-y-6">
        <div>
            <Button variant="outline" asChild>
                <Link href="/admin/dashboard">← Voltar</Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight font-headline mt-4">Detalhes da Submissão</h1>
            {submission.submittedAt ? (
                <p className="text-muted-foreground">
                    Última atualização em: {format(new Date(submission.submittedAt), "dd 'de' MMMM 'de' yyyy, 'às' HH:mm", { locale: ptBR })}
                </p>
            ) : (
                 <p className="text-muted-foreground">Censo em andamento. Nenhuma seção foi salva ainda.</p>
            )}
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
      
       <Accordion type="multiple" className="w-full space-y-4">
        {formConfig.map(sectionConfig => {
          const sectionData = submission.dynamicData?.[sectionConfig.id];
          if (!sectionData) {
            return (
              <Alert key={sectionConfig.id} variant="default">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{sectionConfig.name}</AlertTitle>
                  <AlertDescription>
                    Esta seção ainda não foi preenchida.
                  </AlertDescription>
              </Alert>
            )
          }

          return (
             <Card key={sectionConfig.id}>
                <CardHeader>
                  <CardTitle>{sectionConfig.name}</CardTitle>
                  <CardDescription>{sectionConfig.description}</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sectionConfig.fields.map(fieldConfig => {
                        const value = sectionData[fieldConfig.id];
                        let displayValue: React.ReactNode = "Não informado";
                        if (value !== undefined && value !== null && value !== '') {
                          if (typeof value === 'boolean') {
                            displayValue = value ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-destructive" />;
                          } else {
                            displayValue = String(value);
                          }
                        }
                        return (
                           <div key={fieldConfig.id} className="flex flex-col space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">{fieldConfig.name}</p>
                              <div className="font-semibold">{displayValue}</div>
                           </div>
                        )
                      })}
                   </div>
                </CardContent>
             </Card>
          )
        })}
      </Accordion>
    </div>
  );
}
