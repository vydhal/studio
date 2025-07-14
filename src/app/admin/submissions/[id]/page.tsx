import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SchoolCensusSubmission, School } from "@/types";
import { SubmissionDetail } from "@/components/admin/submissions/SubmissionDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";

async function getSubmission(id: string): Promise<SchoolCensusSubmission | null> {
  const docRef = doc(db, "submissions", id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    submittedAt: data.submittedAt?.toDate(),
  } as SchoolCensusSubmission;
}

async function getSchool(id: string): Promise<School | null> {
    const docRef = doc(db, "schools", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }
    return { id: docSnap.id, ...docSnap.data() } as School;
}

export default async function SubmissionDetailPage({ params }: { params: { id: string } }) {
    const submission = await getSubmission(params.id);

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

    const school = await getSchool(submission.schoolId);

    return <SubmissionDetail submission={submission} school={school} />;
}
