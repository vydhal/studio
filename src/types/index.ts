import { Timestamp } from "firebase/firestore";

export interface School {
  id: string;
  name: string;
  inep: string;
  address?: string;
  number?: string;
  neighborhood?: string;
}

export interface Classroom {
  id?: string; // Optional because it's generated on the fly
  name: string;
  studentCapacity?: number;
  isAdapted?: boolean;
  hasExtraSpace?: boolean;
  extraSpaceDescription?: string;
  occupationType?: 'turn' | 'integral';
  observations?: string;

  // Turno
  studentsMorning?: number;
  gradeMorning?: string;
  studentsAfternoon?: number;
  gradeAfternoon?: string;
  studentsNight?: number;
  gradeNight?: string;

  gradeProjection2026Morning?: string;
  gradeProjection2026Afternoon?: string;
  gradeProjection2026Night?: string;
  
  // Integral
  studentsIntegral?: number;
  gradeIntegral?: string;
  gradeProjection2026Integral?: string;

  hasTv?: boolean;
  hasInternet?: boolean;
  hasAirConditioning?: boolean;
  hasCeiling?: boolean;
  hasBathroom?: boolean;

  hasLinkedTransferMorning?: boolean;
  linkedTransferSchoolIdsMorning?: string[];
  hasLinkedTransferAfternoon?: boolean;
  linkedTransferSchoolIdsAfternoon?: string[];
  hasLinkedTransferNight?: boolean;
  linkedTransferSchoolIdsNight?: string[];
  hasLinkedTransferIntegral?: boolean;
  linkedTransferSchoolIdsIntegral?: string[];
}

export interface TeachingModality {
  id: string;
  name: string;
  offered: boolean;
}

export interface TechnologyResource {
  id: string;
  name: string;
  quantity: number;
}

export interface Professional {
  id: string;
  name: string;
  unidade?: string;
}

export const professionalContractTypes = [
    'EFETIVO ATIVO', 
    'CONTRATO ATIVO', 
    'MOMENTO DO DESCANSO', 
    'JORNADA AMPLIADA',
    'MOMENTO DO DESCANSO - EFETIVO',
    'MOMENTO DO DESCANSO - CONTRATADO'
];
export const professionalObservationTypes = [
    'Nenhuma',
    'ATIVO',
    'HORA AULA - AFASTAMENTO PARA APOSENTADORIA',
    'HORA AULA - FALTA DE PROFESSOR',
    'HORA AULA - FÉRIAS',
    'HORA AULA - LICENÇA COM VENCIMENTOS',
    'HORA AULA - LICENÇA MATERNIDADE',
    'HORA AULA - LICENÇA MÉDICA',
    'HORA AULA - LICENÇA PRÊMIO',
    'HORA AULA - LICENÇA SEM VENCIMENTOS',
    'HORA AULA - PERMUTA CAMPINA GRANDE',
    'HORA AULA - PERMUTA OUTRO MUNICÍPIO',
    'HORA AULA - READAPTAÇÃO',
    'HORA AULA - REDUÇÃO DE CARGA HORÁRIA',
    'HORA AULA - VAGA DO GESTOR',
    'JORNADA AMPLIADA - AFASTAMENTO PARA APOSENTADORIA',
    'JORNADA AMPLIADA - FALTA DE PROFESSOR',
    'JORNADA AMPLIADA - FÉRIAS',
    'JORNADA AMPLIADA - LICENÇA COM VENCIMENTOS',
    'JORNADA AMPLIADA - LICENÇA MATERNIDADE',
    'JORNADA AMPLIADA - LICENÇA MÉDICA',
    'JORNADA AMPLIADA - LICENÇA PRÊMIO',
    'JORNADA AMPLIADA - LICENÇA SEM VENCIMENTOS',
    'JORNada AMPLIADA - PERMUTA CAMPINA GRANDE',
    'JORNADA AMPLIADA - PERMUTA OUTRO MUNICÍPIO',
    'JORNADA AMPLIADA - READAPTAÇÃO',
    'JORNADA AMPLIADA - REDUÇÃO DE CARGA HORÁRIA',
    'JORNADA AMPLIADA - VAGA DO GESTOR',
    'MOMENTO DO DESCANSO - FALTA DE PROFESSOR',
    'MOMENTO DO DESCANSO - LICENÇA MATERNIDADE',
    'MOMENTO DO DESCANSO - LICENÇA MÉDICA',
    'MOMENTO DO DESCANSO - LICENÇA PRÊMIO',
    'MOMENTO DO DESCANSO - PERMUTA CAMPINA GRANDE',
    'MOMENTO DO DESCANSO - PERMUTA OUTRO MUNICÍPIO',
    'PROFESSOR AEE',
    'PROFESSOR MÚSICA',
    'PROFESSOR CAPOEIRA'
];

export const professionalTurnTypes = ['Manhã', 'Tarde', 'Intermediário'];


export interface TeacherAllocation {
    professionalId?: string;
    contractType?: string;
    workload?: number;
    observations?: string;
    turn?: 'Manhã' | 'Tarde' | 'Intermediário';
    annotations?: string;
}

export interface ClassroomAllocation {
    classroomId: string;
    classroomName: string;
    turn: 'morning' | 'afternoon' | 'night' | 'integral';
    grade: string;
    teachers: TeacherAllocation[];
    teachers2026?: TeacherAllocation[];
}


export interface GeneralData {
  status: 'pending' | 'completed';
  totalDesks?: number;
  // Adicionar campos de dados gerais aqui futuramente
}

export interface InfrastructureData {
  status: 'pending' | 'completed';
  classrooms: Classroom[];
}

export interface ProfessionalsData {
  status: 'pending' | 'completed';
  allocations: ClassroomAllocation[];
}

export interface TechnologyData {
    status: 'pending' | 'completed';
    resources: TechnologyResource[];
    hasInternetAccess: boolean;
}

export interface CulturalData {
    status: 'pending' | 'completed';
    // Adicionar campos de dados culturais aqui futuramente
}

export interface MaintenanceData {
    status: 'pending' | 'completed';
    // Adicionar campos de dados de manutenção aqui futuramente
}

export type FormSectionPermission = 'general' | 'infrastructure' | 'professionals' | 'technology' | 'cultural' | 'maintenance' | 'users';

export interface Role {
    id: string;
    name: string;
    permissions: FormSectionPermission[];
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    roleId: string; // Foreign key to Role
    role: Role | null; // Populated role object
    password?: string;
    schoolId?: string; // Foreign key to School
    status?: 'active' | 'inactive';
}


export interface SchoolCensusSubmission {
  id: string;
  schoolId: string;
  general?: GeneralData;
  infrastructure?: InfrastructureData;
  professionals?: ProfessionalsData;
  technology?: TechnologyData;
  cultural?: CulturalData;
  maintenance?: MaintenanceData;
  teachingModalities?: TeachingModality[];
  dynamicData?: {
    [sectionId: string]: {
      [fieldId: string]: any;
    }
  };
  submittedAt: Date | Timestamp;
  submittedBy?: string;
}

export interface HomeSettings {
  appName: string;
  logoUrl?: string;
  title: string;
  subtitle: string;
  description: string;
  footerText: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
}

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


// Types for Dynamic Form Builder
export interface FormFieldConfig {
    id: string;
    sectionId: string;
    name: string;
    type: 'text' | 'number' | 'boolean' | 'date' | 'select' | 'file' | 'rating';
    required: boolean;
    options?: string[]; // For select type
}

export interface FormSectionConfig {
    id: string;
    name: string;
    description?: string;
    fields: FormFieldConfig[];
}
