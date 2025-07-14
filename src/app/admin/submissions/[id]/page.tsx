import type { SchoolCensusSubmission, School, FormSectionConfig } from "@/types";
import { SubmissionDetail } from "@/components/admin/submissions/SubmissionDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";


const getSchools = (): School[] => {
  // This is a server component, so we can't use localStorage here.
  // We'll rely on a function inside the client component to fetch.
  // A real implementation would fetch this from a database.
  return [];
};

const getFormConfig = (): FormSectionConfig[] => {
    // This is a server component, so we can't use localStorage here.
    return [];
}


// This page is now mostly a shell, the client component will fetch the real data.
export default async function SubmissionDetailPage({ params }: { params: { id: string } }) {
    
    // The ID of the submission is the School ID.
    const schoolId = params.id;

    return <SubmissionDetail schoolId={schoolId} />;
}
