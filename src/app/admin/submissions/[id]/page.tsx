import type { SchoolCensusSubmission, School } from "@/types";
import { SubmissionDetail } from "@/components/admin/submissions/SubmissionDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";


const defaultSchools: School[] = [
    { id: 'school1', name: 'Escola Municipal Exemplo 1 (Padrão)', inep: '12345678' },
    { id: 'school2', name: 'Escola Estadual Teste 2 (Padrão)', inep: '87654321' },
    { id: 'school3', name: 'Centro Educacional Modelo 3 (Padrão)', inep: '98765432' },
];

const SCHOOLS_STORAGE_KEY = 'schoolList';

const getSchools = (): School[] => {
  // This is a server component, so we can't use localStorage here.
  // We'll rely on the mock data for now.
  // A real implementation would fetch this from a database.
  return defaultSchools;
};


// Mock data to simulate Firestore fetch
const getMockSubmission = (id: string): SchoolCensusSubmission | null => {
  if (id === 'sub1' || id === 'sub2') {
      const now = new Date();
      const mockSubmissions: { [key: string]: SchoolCensusSubmission } = {
        'sub1':  {
            id: 'sub1',
            schoolId: 'school1',
            general: { status: 'completed' },
            infrastructure: { 
              status: 'completed',
              classrooms: [
                  { id: 'c1', name: 'Sala 1', studentCapacity: 25, outlets: 10, tvCount: 1, chairCount: 25, fanCount: 2, hasInternet: true, hasAirConditioning: false },
                  { id: 'c2', name: 'Sala 2', studentCapacity: 30, outlets: 12, tvCount: 1, chairCount: 30, fanCount: 2, hasInternet: true, hasAirConditioning: true },
              ]
            },
            technology: { 
              status: 'completed',
              resources: [{ id: '1', name: 'Chromebooks', quantity: 20 }, { id: '2', name: 'Impressoras', quantity: 2 }],
              hasInternetAccess: true
            },
            cultural: { status: 'pending' },
            maintenance: { status: 'completed' },
            teachingModalities: [{ id: '1', name: 'Anos Iniciais', offered: true }, { id: '2', name: 'Anos Finais', offered: true }],
            submittedAt: new Date(now.setDate(now.getDate() - 1)),
            submittedBy: 'test-user'
          },
          'sub2': {
            id: 'sub2',
            schoolId: 'school2',
            general: { status: 'completed' },
            infrastructure: { 
              status: 'completed',
              classrooms: [
                  { id: 'c1', name: 'Sala A', studentCapacity: 20, outlets: 8, tvCount: 1, chairCount: 20, fanCount: 1, hasInternet: false, hasAirConditioning: false },
              ]
            },
            technology: { 
              status: 'pending',
              resources: [{ id: '3', name: 'Notebooks', quantity: 15 }],
              hasInternetAccess: true,
            },
            cultural: { status: 'pending' },
            maintenance: { status: 'pending' },
            teachingModalities: [{ id: '3', name: 'EJA', offered: true }],
            submittedAt: new Date(now.setDate(now.getDate() - 2)),
            submittedBy: 'test-user-2'
          }
      };
      return mockSubmissions[id];
  }
  return null;
}

const getMockSchool = (id: string): School | null => {
    const allSchools = getSchools();
    return allSchools.find(s => s.id === id) || null;
}

export default async function SubmissionDetailPage({ params }: { params: { id: string } }) {
    const submission = getMockSubmission(params.id);

    if (!submission) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle/>
                        Submissão não encontrada
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p>A submissão com o ID solicitado não foi encontrada em nosso banco de dados.</p>
                     <Button asChild variant="link" className="px-0">
                        <Link href="/admin/dashboard">Voltar para o Dashboard</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    const school = getMockSchool(submission.schoolId);

    return <SubmissionDetail submission={submission} school={school} />;
}
