"use client";

import { useState } from "react";
import type { SchoolCensusSubmission, School } from "@/types";
import { MetricsCards } from "./MetricsCards";
import { ChartsSection } from "./ChartsSection";
import { SubmissionsTable } from "./SubmissionsTable";
import { Input } from "@/components/ui/input";

interface DashboardClientProps {
  submissions: SchoolCensusSubmission[];
  schools: School[];
}

export function DashboardClient({ submissions, schools }: DashboardClientProps) {
  const [filter, setFilter] = useState("");

  const schoolMap = new Map(schools.map(s => [s.id, s]));

  const filteredSubmissions = submissions.filter(submission => {
    const school = schoolMap.get(submission.schoolId);
    if (!school) return false;
    return school.name.toLowerCase().includes(filter.toLowerCase()) || 
           school.inep.toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <div className="space-y-8">
      <MetricsCards submissions={submissions} schools={schools} />
      <ChartsSection submissions={filteredSubmissions} schoolMap={schoolMap} />
      <div>
        <h2 className="text-2xl font-bold mb-4 font-headline">Submissões Recentes</h2>
        <div className="mb-4">
            <Input 
                placeholder="Filtrar por nome ou INEP da escola..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="max-w-sm"
            />
        </div>
        <SubmissionsTable submissions={filteredSubmissions} schoolMap={schoolMap} />
      </div>
    </div>
  );
}
