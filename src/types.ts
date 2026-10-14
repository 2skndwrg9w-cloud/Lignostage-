export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  points: string[];
  specs?: {
    label: string;
    value: string;
  }[];
}

export interface TeamMember {
  name: string;
  role: string;
  focus: string;
  background: string[];
}

export interface ProjectPhoto {
  id: string;
  projectId: string;
  projectName: string; // Festival oder Projekt
  title: string;
  category: 'buehne' | 'stage-design';
  description: string;
  sourceUrl?: string;
  isCustom?: boolean;
  qualityTier?: 'hd' | 'standard' | 'detail';
  sizeVariant?: 'large' | 'medium' | 'compact';
  orientation?: 'querformat' | 'hochformat' | 'quadrat';
  isHeroBackground?: boolean;
  fileName?: string;
  rotation?: number; // 0, 90, 180, 270 degrees
}

export interface ProjectVideo {
  id: string;
  projectName: string; // Welches Festival
  category: 'buehne' | 'stage-design'; // Holzbühne oder Stage Design
  title: string;
  description?: string;
  sourceUrl?: string;
  driveViewUrl?: string;
}

export interface CompanyConfig {
  name: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  city: string;
  street: string;
  postalCode: string;
  region: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  service: string;
  region?: string;
  message: string;
}

export interface PlanningMediaItem {
  id: string;
  projectName: string; // Festival oder Projekt z.B. 'Firle Fanz Festival 2026'
  title: string;
  category: 'visualisierung' | 'zeichnung';
  description: string;
  format: '3D-Modell' | 'Statik-Plan' | 'CAD-Schnitt' | 'Rasterplan' | 'Lichtkonzept' | string;
  sourceUrl?: string;
  isCustom?: boolean;
  fileType?: 'image' | 'pdf';
  fileName?: string;
  fileSize?: string;
  rotation?: number; // 0, 90, 180, 270 degrees
}

