
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type PresetType = 'ai-magic' | 'avenue-montaigne' | 'jardin-palais' | 'artisanal-atelier' | 'champagne-soiree' | 'saint-germain' | 'solid-chic';

export interface Preset {
  id: PresetType;
  label: string;
  description: string;
  icon: string;
}

export interface ProductImage {
  id: string;
  originalUrl: string;
  processedUrl?: string;
  status: ProcessingStatus;
  name: string;
  error?: string;
  progress: number;
}

export interface BrandingConfig {
  logoVisible: boolean;
  logoPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'center';
  logoOpacity: number;
  upscale: boolean;
  activePreset: PresetType;
  selectedLogoId?: string;
  selectedColor?: string;
}

export interface BrandLogo {
  id: string;
  url: string;
  name: string;
}
