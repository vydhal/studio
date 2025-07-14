import { DashboardClient } from "@/components/admin/dashboard/DashboardClient";
import type { SchoolCensusSubmission, School } from "@/types";

// Mock data to simulate Firestore fetch
const getMockSubmissions = (): SchoolCensusSubmission[] => {
  const now = new Date();
  return [
    {
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
    {
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
  ];
};

const getMockSchools = (): School[] => {
  return [
    { id: 'school1', name: 'Escola Municipal Exemplo 1', inep: '12345678' },
    { id: 'school2', name: 'Escola Estadual Teste 2', inep: '87654321' },
    { id: 'school3', name: 'Centro Educacional Modelo 3', inep: '98765432' },
  ];
};


export default async function DashboardPage() {
    const submissions = getMockSubmissions();
    const schools = getMockSchools();

    return (
        <div className="space-y-4">
            <DashboardClient submissions={submissions} schools={schools} />
        </div>
    );
}

export const revalidate = 0;
