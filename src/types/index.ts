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
  studentCount: number;
}

export interface Technology {
  id: string;
  name: string;
  hasIt: boolean;
}

export interface SchoolCensusSubmission {
  id: string;
  schoolId: string;
  classrooms: Classroom[];
  teachingModalities: TeachingModality[];
  technologies: Technology[];
  submittedAt: Date;
  submittedBy?: string;
}

export interface HomeSettings {
  logoUrl?: string;
  title: string;
  subtitle: string;
  description: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
}
