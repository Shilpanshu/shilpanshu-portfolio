export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  location: string;
  description: string[];
}

export interface Education {
  school: string;
  degree: string;
  period: string;
  details?: string[];
}

export interface SkillCategory {
  name: string;
  skills: string[];
  level: number; // 0-100 for visualization
}

export interface Project {
  id: string;
  title: string;
  year: string;
  description: string;
  longDescription?: string;
  tags: string[];
  icon: 'ar' | 'bot' | 'web' | 'code' | 'ai' | 'design';
  link?: string;
  images?: string[];
  challenges?: string;
  techStack?: string[];
}

export interface Profile {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  linkedin: string;
  website: string;
}