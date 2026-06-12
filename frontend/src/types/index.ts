export type ModelType = 'FLUX' | 'FLUX_SCHNELL' | 'SDXL' | 'SD_1_5' | 'REALISTIC_VISION' | 'CUSTOM';

export interface Model {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: 'text-to-image' | 'image-to-image';
  performance: 'fast' | 'balanced' | 'high-quality';
  size: string;
  vram: number;
  speed: number;
  quality: number;
  lastUsed?: string;
  installed: boolean;
}

export interface GenerationParams {
  prompt: string;
  negativePrompt?: string;
  model: string;
  width: number;
  height: number;
  steps: number;
  cfgScale: number;
  seed?: number;
  randomSeed: boolean;
  count: number;
  samplerName?: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  thumbnail?: string;
  prompt: string;
  negativePrompt?: string;
  model: string;
  params: GenerationParams;
  createdAt: string;
  generationTime: number;
  isFavorite: boolean;
}

export interface Generation {
  id: string;
  images: GeneratedImage[];
  prompt: string;
  negativePrompt?: string;
  model: string;
  status: 'queued' | 'generating' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  gridSize: 'sm' | 'md' | 'lg';
  defaultModel: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultSteps: number;
  defaultCfgScale: number;
  autoSavePrompts: boolean;
  notifications: {
    generationComplete: boolean;
    generationFailed: boolean;
    updates: boolean;
  };
}

export interface ApiSettings {
  provider: 'local' | 'openai' | 'gemini' | 'huggingface';
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export interface LocalSettings {
  enabled: boolean;
  type: 'ollama' | 'stable-diffusion' | 'comfyui';
  baseUrl: string;
  port: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  content: string;
  isFavorite: boolean;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
