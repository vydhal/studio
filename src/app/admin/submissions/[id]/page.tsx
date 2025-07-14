
import type { SchoolCensusSubmission, School } from "@/types";
import { SubmissionDetail } from "@/components/admin/submissions/SubmissionDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";

// Mock data to simulate Firestore fetch
const getMockSubmission = (id: string): SchoolCensusSubmission | null => {
  if (id === 'sub1' || id === 'sub2') {
      const now = new Date();
      const mockSubmissions: { [key: string]: SchoolCensusSubmission } = {
        'sub1': {
          id: 'sub1',
          schoolId: 'school1',
          classrooms: [
            { id: 'c1', name: 'Sala 1', studentCapacity: 25, outlets: 10, tvCount: 1, chairCount: 25, fanCount: 2, hasInternet: true, hasAirConditioning: false },
            { id: 'c2', name: 'Sala 2', studentCapacity: 30, outlets: 12, tvCount: 1, chairCount: 30, fanCount: 2, hasInternet: true, hasAirConditioning: true },
          ],
          teachingModalities: [{ id: '1', name: 'Anos Iniciais', offered: true }, { id: '2', name: 'Anos Finais', offered: true }],
          technologyResources: [{ id: '1', name: 'Chromebooks', quantity: 20 }, { id: '2', name: 'Impressoras', quantity: 2 }],
          hasInternet: true,
          submittedAt: new Date(now.setDate(now.getDate() - 1)),
          submittedBy: 'test-user'
        },
        'sub2': {
          id: 'sub2',
          schoolId: 'school2',
          classrooms: [
            { id: 'c1', name: 'Sala A', studentCapacity: 20, outlets: 8, tvCount: 1, chairCount: 20, fanCount: 1, hasInternet: false, hasAirConditioning: false },
          ],
          teachingModalities: [{ id: '3', name: 'EJA', offered: true }],
          technologyResources: [{ id: '3', name: 'Notebooks', quantity: 15 }],
          hasInternet: true,
          submittedAt: new Date(now.setDate(now.getDate() - 2)),
          submittedBy: 'test-user-2'
        }
      };
      return mockSubmissions[id];
  }
  return null;
}

const getMockSchool = (id: string): School | null => {
    const mockSchools: { [key: string]: School } = {
        'school1': { id: 'school1', name: 'Escola Municipal Exemplo 1', inep: '12345678' },
        'school2': { id: 'school2', name: 'Escola Estadual Teste 2', inep: '87654321' },
    };
    return mockSchools[id] || null;
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
