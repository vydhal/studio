import { DashboardClient } from "@/components/admin/dashboard/DashboardClient";
import type { SchoolCensusSubmission, School } from "@/types";

// Mock data to simulate Firestore fetch
const getMockSubmissions = (): SchoolCensusSubmission[] => {
  const now = new Date();
  return [
    {
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
    {
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
  ];
};

const getMockSchools = (): School[] => {
  return [
    { id: 'school1', name: 'Escola Municipal Exemplo 1', inep: '12345678' },
    { id: 'school2', name: 'Escola Estadual Teste 2', inep: '87654321' },
  ];
};


export default async function DashboardPage() {
    const submissions = getMockSubmissions();
    const schools = getMockSchools();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
                <p className="text-muted-foreground">Visão geral dos dados do censo escolar.</p>
            </div>
            <DashboardClient submissions={submissions} schools={schools} />
        </div>
    );
}

export const revalidate = 0; // No revalidation needed for mock data
