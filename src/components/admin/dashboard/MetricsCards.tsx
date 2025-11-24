

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SchoolCensusSubmission, School, Classroom } from "@/types";
import { Users, School2, Wifi, Armchair, FilePenLine, UserPlus, UserCheck } from "lucide-react";

// Grade progression mapping for 2025 -> 2026
const gradeProgression: { [key: string]: string } = {
    "Berçário I": "Berçário II",
    "Berçário II": "Maternal I",
    "Maternal I": "Maternal II",
    "Maternal II": "Pré I",
    "Pré I": "Pré II",
    "Pré II": "1º Ano",
    "1º Ano": "2º Ano",
    "2º Ano": "3º Ano",
    "3º Ano": "4º Ano",
    "4º Ano": "5º Ano",
    "5º Ano": "6º Ano",
    "6º Ano": "7º Ano",
    "7º Ano": "8º Ano",
    "8º Ano": "9º Ano",
    // EJA and other complex progressions can be added here if needed
};

export interface VacancyDetail {
    schoolId: string;
    classroomName: string;
    grade2025: string;
    students2025: number;
    projectedGrade: string;
    turn: string;
    capacity: number;
    veterans: number;
    newcomers: number;
    total: number;
}

interface VacancyData {
    totalVeterans: number;
    totalNewcomers: number;
    details: VacancyDetail[];
}

export const calculateVacancyData = (submissions: SchoolCensusSubmission[]): VacancyData => {
    let totalVeterans = 0;
    let totalNewcomers = 0;
    const details: VacancyDetail[] = [];

    // Step 1: Create a mutable pool of current year students, segregated by school, grade, AND turn.
    const mutableStudentPool: { [schoolId: string]: { [gradeAndTurn: string]: number } } = {};
    const unallocatedStudents: { [schoolId: string]: { [grade: string]: number } } = {};

    submissions.forEach(sub => {
        if (!sub.infrastructure?.classrooms) return;
        mutableStudentPool[sub.schoolId] = mutableStudentPool[sub.schoolId] || {};
        unallocatedStudents[sub.schoolId] = unallocatedStudents[sub.schoolId] || {};
        
        sub.infrastructure.classrooms.forEach(room => {
            const addStudentsToPool = (grade: string | undefined, turn: string, count: number | undefined) => {
                if (grade && count && count > 0) {
                    const key = `${grade}-${turn}`;
                    mutableStudentPool[sub.schoolId][key] = (mutableStudentPool[sub.schoolId][key] || 0) + count;
                }
            };

            addStudentsToPool(room.gradeIntegral, 'integral', room.studentsIntegral);
            addStudentsToPool(room.gradeMorning, 'morning', room.studentsMorning);
            addStudentsToPool(room.gradeAfternoon, 'afternoon', room.studentsAfternoon);
            addStudentsToPool(room.gradeNight, 'night', room.studentsNight);
        });
    });

    const projectedClassrooms = submissions.flatMap(sub => 
        sub.infrastructure?.classrooms.map(room => ({ ...room, schoolId: sub.schoolId })) || []
    );

    const processProjectedTurn = (room: Classroom & { schoolId: string }, projectedGrade: string | undefined, turn: 'Manhã' | 'Tarde' | 'Noite' | 'Integral', turnKey: 'morning' | 'afternoon' | 'night' | 'integral') => {
        if (!projectedGrade) return;

        const capacity = room.studentCapacity || 0;
        const precedingGrade = Object.keys(gradeProgression).find(key => gradeProgression[key] === projectedGrade);
        
        let veteransForThisRoom = 0;
        let studentsInPrecedingGrade = 0;
        const schoolPool = mutableStudentPool[room.schoolId] || {};
        const schoolUnallocatedPool = unallocatedStudents[room.schoolId] || {};

        if (precedingGrade) {
            const possiblePrecedingTurnKeys = ['morning', 'afternoon', 'night', 'integral'];
            
            // First, try to find students from the corresponding turn
            let precedingGradeKey = `${precedingGrade}-${turnKey}`;
            
            // If no match for the specific turn, try any turn
            if (!schoolPool[precedingGradeKey] || schoolPool[precedingGradeKey] === 0) {
                 const foundKey = possiblePrecedingTurnKeys.find(key => schoolPool[`${precedingGrade}-${key}`] > 0);
                 if (foundKey) {
                    precedingGradeKey = `${precedingGrade}-${foundKey}`;
                 }
            }

            studentsInPrecedingGrade = schoolPool[precedingGradeKey] || 0;
            
            if (studentsInPrecedingGrade > 0) {
                const availableVeterans = studentsInPrecedingGrade;
                veteransForThisRoom = Math.min(capacity, availableVeterans);
                schoolPool[precedingGradeKey] -= veteransForThisRoom;
                
                const surplus = availableVeterans - veteransForThisRoom;
                if (surplus > 0) {
                    schoolUnallocatedPool[precedingGrade] = (schoolUnallocatedPool[precedingGrade] || 0) + surplus;
                }
            }
        }
        
        // Try to fill remaining capacity with unallocated students
        if (veteransForThisRoom < capacity && schoolUnallocatedPool[projectedGrade] > 0) {
            const needed = capacity - veteransForThisRoom;
            const fromUnallocated = Math.min(needed, schoolUnallocatedPool[projectedGrade]);
            veteransForThisRoom += fromUnallocated;
            schoolUnallocatedPool[projectedGrade] -= fromUnallocated;
        }

        const newcomers = Math.max(0, capacity - veteransForThisRoom);
        totalNewcomers += newcomers;
        totalVeterans += veteransForThisRoom;

        const originalPoolKey = precedingGrade ? `${precedingGrade}-${turnKey}` : "N/A";
        const originalStudentCount = (mutableStudentPool[room.schoolId] || {})[originalPoolKey] || 0;
        
        // Find the original total for the preceding grade across all turns for display
        let totalStudentsInPrecedingGrade = 0;
        if(precedingGrade) {
            for(const key in mutableStudentPool[room.schoolId]) {
                if(key.startsWith(precedingGrade + "-")) {
                    totalStudentsInPrecedingGrade += mutableStudentPool[room.schoolId][key];
                }
            }
        }


        details.push({
            schoolId: room.schoolId,
            classroomName: room.name,
            grade2025: precedingGrade || "N/A (Entrada)",
            students2025: studentsInPrecedingGrade,
            projectedGrade: projectedGrade,
            turn: turn,
            capacity: capacity,
            veterans: veteransForThisRoom,
            newcomers: newcomers,
            total: veteransForThisRoom + newcomers,
        });
    };

    projectedClassrooms.forEach(room => {
         if (room.occupationType2026 === 'integral') {
            processProjectedTurn(room, room.gradeProjection2026Integral, 'Integral', 'integral');
         } else {
            processProjectedTurn(room, room.gradeProjection2026Morning, 'Manhã', 'morning');
            processProjectedTurn(room, room.gradeProjection2026Afternoon, 'Tarde', 'afternoon');
            processProjectedTurn(room, room.gradeProjection2026Night, 'Noite', 'night');
         }
    });

    return { totalVeterans, totalNewcomers, details };
};


interface MetricsCardsProps {
  submissions: SchoolCensusSubmission[];
  schools: School[];
  vacancyData: VacancyData;
}

export function MetricsCards({ submissions, schools, vacancyData }: MetricsCardsProps) {
  
  const totalClassrooms = submissions.reduce((acc, sub) => acc + (sub.infrastructure?.classrooms?.length || 0), 0);
  
  const totalStudentCapacity = submissions.reduce((acc, sub) => {
    const classroomCapacity = sub.infrastructure?.classrooms?.reduce((classAcc, room) => classAcc + (room.studentCapacity || 0), 0) || 0;
    return acc + classroomCapacity;
  }, 0);


  const totalSchools = schools.length;

  const completedSubmissions = submissions.filter(s => {
      // Logic for what is considered a complete submission
      const totalSections = 5; // This should be dynamic based on formConfig
      const sections = [s.general, s.infrastructure, s.technology, s.cultural, s.maintenance];
      const completedCount = sections.filter(sec => sec?.status === 'completed').length;
      return completedCount >= totalSections;
  }).length;

  const startedSubmissions = submissions.length;

  const metrics = [
    { title: "Escolas", value: totalSchools, icon: School2, description: "Total de unidades no filtro" },
    { title: "Vagas Ofertadas (2026)", value: vacancyData.totalNewcomers.toLocaleString(), icon: UserPlus, description: "Total de vagas para novatos" },
    { title: "Total de Veteranos (2026)", value: vacancyData.totalVeterans.toLocaleString(), icon: UserCheck, description: "Alunos que progridem de série" },
    { title: "Salas de Aula", value: totalClassrooms.toLocaleString(), icon: Armchair, description: "Soma de todas as salas" },
    { title: "Questionários Enviados", value: `${startedSubmissions}/${totalSchools}`, icon: FilePenLine, description: "Total de censos com dados" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">{metric.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
