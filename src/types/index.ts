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
  occupationType?: 'turn' | 'integral';

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
  gradeIntegral?: string;
  gradeProjection2026Integral?: string;

  hasTv?: boolean;
  hasInternet?: boolean;
  hasAirConditioning?: boolean;
  hasCeiling?: boolean;
  hasBathroom?: boolean;
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

export const professionalContractTypes = ['EFETIVO ATIVO', 'CONTRATO ATIVO', 'MOMENTO DO DESCANSO', 'JORNADA AMPLIADA'];
export const professionalObservationTypes = [
    'Nenhuma',
    'PERMUTA',
    'PERMUTA OUTRO MUNICÍPIO',
    'LICENÇA MÉDICA',
    'LICENÇA PRÊMIO',
    'LICENÇA COM VENCIMENTOS',
    'LICENÇA SEM VENCIMENTOS',
    'VAGA DO GESTOR',
    'AFASTADO PARA APOSENTADORIA',
];

export interface TeacherAllocation {
    professionalId?: string;
    contractType?: string;
    workload?: number;
    observations?: string;
}

export interface ClassroomAllocation {
    classroomId: string;
    classroomName: string;
    turn: 'morning' | 'afternoon' | 'night' | 'integral';
    grade: string;
    teachers: TeacherAllocation[];
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
