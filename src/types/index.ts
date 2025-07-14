

export interface School {
  id: string;
  name: string;
  inep: string;
}

export interface Classroom {
  id: string;
  name: string;
  studentCapacity: number;
  outlets: number;
  tvCount: number;
  chairCount: number;
  fanCount: number;
  hasInternet: boolean;
  hasAirConditioning: boolean;
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

export interface GeneralData {
  status: 'pending' | 'completed';
  // Adicionar campos de dados gerais aqui futuramente
}

export interface InfrastructureData {
  status: 'pending' | 'completed';
  classrooms: Classroom[];
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

export type FormSectionPermission = 'general' | 'infrastructure' | 'technology' | 'cultural' | 'maintenance' | 'users';

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
    password?: string;
}


export interface SchoolCensusSubmission {
  id: string;
  schoolId: string;
  general: GeneralData;
  infrastructure: InfrastructureData;
  technology: TechnologyData;
  cultural: CulturalData;
  maintenance: MaintenanceData;
  teachingModalities: TeachingModality[];
  submittedAt: Date;
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
