

export interface School {
  id: string;
  name: string;
  inep: string;
  address?: string;
  number?: string;
  neighborhood?: string;
  zipCode?: string;
  email?: string;
  phoneNumbers?: string[];
}

export interface Classroom {
  id?: string; // Optional because it's generated on the fly
  name: string;
  studentCapacity?: number;
  outlets?: number;
  tvCount?: number;
  chairCount?: number;
  fanCount?: number;
  hasInternet?: boolean;
  hasAirConditioning?: boolean;
  gradeMorning?: string;
  gradeAfternoon?: string;
  gradeProjection2025Morning?: string;
  gradeProjection2025Afternoon?: string;
  gradeProjection2026Morning?: string;
  gradeProjection2026Afternoon?: string;
}

export interface ManagementMember {
  id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
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
  totalDesks?: number;
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

export interface FurnitureData {
  status: 'pending' | 'completed';
}

export interface InventoryItem {
  id?: string;
  description: string;
  quantity: number;
  origin: string;
  observation?: string;
}

export interface InventoryData {
  status: 'pending' | 'completed';
  permanent_tech?: InventoryItem[];
  audio_visual?: InventoryItem[];
  connected_edu?: InventoryItem[];
  pedagogical_games?: InventoryItem[];
  pedagogical_aee?: InventoryItem[];
  physical_edu?: InventoryItem[];
  office_supplies?: InventoryItem[];
  hygiene_cleaning?: InventoryItem[];
  warehouse?: InventoryItem[];
  library?: InventoryItem[];
}

export type FormSectionPermission = 'general' | 'infrastructure' | 'tech' | 'cultural' | 'maintenance' | 'users' | 'furniture' | 'inventory' | 'management';

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
  schoolId?: string; // Optional: Assigns user to a specific school
}


export interface SchoolCensusSubmission {
  id: string;
  schoolId: string;
  general?: GeneralData;
  infrastructure?: InfrastructureData;
  management?: {
    status?: 'pending' | 'completed';
    members: ManagementMember[];
  };
  technology?: TechnologyData;
  cultural?: CulturalData;
  maintenance?: MaintenanceData;
  furniture?: FurnitureData;
  inventory?: InventoryData;
  teachingModalities?: TeachingModality[];

  dynamicData?: {
    [sectionId: string]: {
      [fieldId: string]: any;
    }
  };
  submittedAt?: Date;
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
  primaryColor?: string;
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
