import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SchoolCensusSubmission, School } from "@/types";
import { DashboardClient } from "@/components/admin/dashboard/DashboardClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

async function getSubmissions() {
  const submissionsCol = query(collection(db, "submissions"), orderBy("submittedAt", "desc"));
  const submissionSnapshot = await getDocs(submissionsCol);
  const submissionList = submissionSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      submittedAt: data.submittedAt?.toDate(),
    } as SchoolCensusSubmission;
  });
  return submissionList;
}

async function getSchools() {
    const schoolsCollection = collection(db, "schools");
    const schoolSnapshot = await getDocs(schoolsCollection);
    const schoolList = schoolSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School));
    return schoolList;
}

export default async function DashboardPage() {
    try {
        const submissions = await getSubmissions();
        const schools = await getSchools();

        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
                    <p className="text-muted-foreground">Visão geral dos dados do censo escolar.</p>
                </div>
                <DashboardClient submissions={submissions} schools={schools} />
            </div>
        );
    } catch (error) {
        console.error("Failed to load dashboard data:", error);
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle/>
                        Erro ao carregar o Dashboard
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Não foi possível carregar os dados das submissões. Verifique a conexão com o Firebase e tente novamente.</p>
                    <p className="text-sm text-muted-foreground mt-2">Detalhes do erro: {(error as Error).message}</p>
                </CardContent>
            </Card>
        )
    }
}

export const revalidate = 60; // Revalidate data every 60 seconds
