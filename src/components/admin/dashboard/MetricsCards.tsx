

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
    const allCurrentYearStudents: { [schoolId: string]: { [grade: string]: number } } = {};

    // 1. Aggregate all current students by school and grade for the base year (2025)
    submissions.forEach(sub => {
        if (!sub.infrastructure?.classrooms) return;
        allCurrentYearStudents[sub.schoolId] = allCurrentYearStudents[sub.schoolId] || {};

        sub.infrastructure.classrooms.forEach(room => {
             if (room.occupationType === 'integral' && room.gradeIntegral) {
                allCurrentYearStudents[sub.schoolId][room.gradeIntegral] = (allCurrentYearStudents[sub.schoolId][room.gradeIntegral] || 0) + (room.studentsIntegral || 0);
            } else {
                if (room.gradeMorning) allCurrentYearStudents[sub.schoolId][room.gradeMorning] = (allCurrentYearStudents[sub.schoolId][room.gradeMorning] || 0) + (room.studentsMorning || 0);
                if (room.gradeAfternoon) allCurrentYearStudents[sub.schoolId][room.gradeAfternoon] = (allCurrentYearStudents[sub.schoolId][room.gradeAfternoon] || 0) + (room.studentsAfternoon || 0);
                if (room.gradeNight) allCurrentYearStudents[sub.schoolId][room.gradeNight] = (allCurrentYearStudents[sub.schoolId][room.gradeNight] || 0) + (room.studentsNight || 0);
            }
        });
    });

    // Create a mutable copy of the student pool for distribution
    const mutableStudentPool = JSON.parse(JSON.stringify(allCurrentYearStudents));

    // 2. Iterate through projected 2026 classrooms to calculate vacancies
    submissions.forEach(sub => {
        if (!sub.infrastructure?.classrooms) return;

        const processProjectedTurn = (room: Classroom, projectedGrade: string | undefined, turn: string) => {
            if (!projectedGrade) return;

            const capacity = room.studentCapacity || 0;
            const precedingGrade = Object.keys(gradeProgression).find(key => gradeProgression[key] === projectedGrade);
            
            let veteransForThisRoom = 0;
            let totalStudentsInPrecedingGrade = 0;

            if (precedingGrade) {
                totalStudentsInPrecedingGrade = allCurrentYearStudents[sub.schoolId]?.[precedingGrade] || 0;
                
                if (mutableStudentPool[sub.schoolId]?.[precedingGrade]) {
                    // Determine how many veterans can be allocated to this room
                    const availableVeterans = mutableStudentPool[sub.schoolId][precedingGrade];
                    veteransForThisRoom = Math.min(capacity, availableVeterans);

                    // Decrease the pool of available veterans
                    mutableStudentPool[sub.schoolId][precedingGrade] -= veteransForThisRoom;
                }
            }

            const newcomers = Math.max(0, capacity - veteransForThisRoom);
            const totalFor2026 = veteransForThisRoom; // The actual number of students in the room will be the veterans
            totalNewcomers += newcomers;
            totalVeterans += veteransForThisRoom;

            details.push({
                schoolId: sub.schoolId,
                classroomName: room.name,
                grade2025: precedingGrade || "N/A (Entrada)",
                students2025: totalStudentsInPrecedingGrade,
                projectedGrade: projectedGrade,
                turn: turn,
                capacity: capacity,
                veterans: veteransForThisRoom,
                newcomers: newcomers,
                total: capacity, // Total capacity of the room
            });
        };
        
        sub.infrastructure.classrooms.forEach(room => {
             if (room.occupationType2026 === 'integral') {
                processProjectedTurn(room, room.gradeProjection2026Integral, 'Integral');
             } else {
                processProjectedTurn(room, room.gradeProjection2026Morning, 'Manhã');
                processProjectedTurn(room, room.gradeProjection2026Afternoon, 'Tarde');
                processProjectedTurn(room, room.gradeProjection2026Night, 'Noite');
             }
        });
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
