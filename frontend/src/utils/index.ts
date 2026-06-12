import type { GeneratedImage, Model } from '@/types';

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function truncate(text: string, length: number): string {
  return text.length > length ? text.substring(0, length) + '...' : text;
}

export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export function generateImageFilename(prompt: string, timestamp: Date = new Date()): string {
  const sanitized = prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const date = timestamp.toISOString().split('T')[0];
  const time = timestamp.getHours().toString().padStart(2, '0') +
    timestamp.getMinutes().toString().padStart(2, '0');
  return `image_${sanitized}_${date}_${time}.png`;
}

export const MODEL_BADGES: Record<string, { label: string; color: string }> = {
  'flux': { label: 'flux', color: 'bg-blue-600' },
  'FLUX_SCHNELL': { label: 'flux Schnell', color: 'bg-blue-500' },
  'SDXL': { label: 'SDXL', color: 'bg-purple-600' },
  'SD_1_5': { label: 'SD 1.5', color: 'bg-purple-500' },
  'REALISTIC_VISION': { label: 'Realistic Vision', color: 'bg-indigo-600' },
};

export const PERFORMANCE_BADGES: Record<string, string> = {
  'fast': '⚡ Fast',
  'balanced': '⚙️ Balanced',
  'high-quality': '✨ High Quality',
};

export const ASPECT_RATIOS = {
  'square': { width: 768, height: 768, label: '1:1 Square' },
  'portrait': { width: 576, height: 768, label: '3:4 Portrait' },
  'landscape': { width: 1024, height: 576, label: '16:9 Landscape' },
  'mobile': { width: 512, height: 768, label: '9:16 Mobile' },
};

export function validatePrompt(prompt: string): { valid: boolean; error?: string } {
  if (!prompt.trim()) {
    return { valid: false, error: 'Prompt cannot be empty' };
  }
  if (prompt.length > 2000) {
    return { valid: false, error: 'Prompt must be less than 2000 characters' };
  }
  return { valid: true };
}

export function validateImageDimensions(
  width: number,
  height: number
): { valid: boolean; error?: string } {
  if (width < 256 || width > 2048) {
    return { valid: false, error: 'Width must be between 256 and 2048' };
  }
  if (height < 256 || height > 2048) {
    return { valid: false, error: 'Height must be between 256 and 2048' };
  }
  if ((width * height) > (2048 * 2048)) {
    return { valid: false, error: 'Total pixels must not exceed 2048x2048' };
  }
  return { valid: true };
}

export function parseErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    if ('data' in error && typeof error.data === 'object' && error.data !== null) {
      if ('message' in error.data && typeof error.data.message === 'string') {
        return error.data.message;
      }
    }
  }
  return 'An unknown error occurred';
}

export const MOCK_STATS = {
  totalGenerated: 1248,
  modelsAvailable: 5,
  totalFavorites: 87,
  avgGenerationTime: 6.8,
  weeklyData: [
    { day: 'Mon', count: 42 },
    { day: 'Tue', count: 58 },
    { day: 'Wed', count: 37 },
    { day: 'Thu', count: 74 },
    { day: 'Fri', count: 63 },
    { day: 'Sat', count: 91 },
    { day: 'Sun', count: 69 },
  ],
};

export const MOCK_MODELS: Model[] = [
  {
    id: 'flux',
    name: 'Flux-dev',
    displayName: 'Flux Dev',
    description: 'State-of-the-art text-to-image model with excellent prompt adherence and photorealism.',
    category: 'text-to-image',
    performance: 'high-quality',
    size: '23.8 GB',
    vram: 24,
    speed: 68,
    quality: 96,
    lastUsed: '2 hours ago',
    installed: true,
  },
  {
    id: 'FLUX_SCHNELL',
    name: 'flux-schnell',
    displayName: 'flux Schnell',
    description: 'Fast flux variant optimized for rapid iteration with strong visual quality.',
    category: 'text-to-image',
    performance: 'fast',
    size: '23.8 GB',
    vram: 16,
    speed: 94,
    quality: 84,
    lastUsed: '1 hour ago',
    installed: true,
  },
  {
    id: 'SDXL',
    name: 'stable-diffusion-xl',
    displayName: 'Stable Diffusion XL',
    description: 'High-resolution general model with strong composition and broad style coverage.',
    category: 'text-to-image',
    performance: 'balanced',
    size: '6.5 GB',
    vram: 10,
    speed: 74,
    quality: 88,
    lastUsed: '3 hours ago',
    installed: true,
  },
  {
    id: 'SD_1_5',
    name: 'stable-diffusion-1-5',
    displayName: 'Stable Diffusion 1.5',
    description: 'Classic lightweight model with broad community fine-tune support.',
    category: 'text-to-image',
    performance: 'fast',
    size: '2.0 GB',
    vram: 6,
    speed: 89,
    quality: 72,
    lastUsed: '1 day ago',
    installed: true,
  },
  {
    id: 'REALISTIC_VISION',
    name: 'realistic-vision',
    displayName: 'Realistic Vision v6',
    description: 'Fine-tuned model specializing in realistic portraits and lifestyle photography.',
    category: 'text-to-image',
    performance: 'balanced',
    size: '2.0 GB',
    vram: 8,
    speed: 70,
    quality: 91,
    lastUsed: '5 hours ago',
    installed: true,
  },
];

const demoParams = {
  prompt: '',
  negativePrompt: '',
  model: 'flux',
  width: 768,
  height: 768,
  steps: 20,
  cfgScale: 7.5,
  randomSeed: true,
  count: 1,
};

export const MOCK_IMAGES: GeneratedImage[] = [
  {
    id: 'img-aurora-city',
    url: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80',
    prompt: 'Aurora lights over a glass city at midnight',
    model: 'flux',
    params: { ...demoParams, prompt: 'Aurora lights over a glass city at midnight' },
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    generationTime: 5.9,
    isFavorite: true,
  },
  {
    id: 'img-studio-robot',
    url: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=900&q=80',
    prompt: 'A friendly studio robot painting neon clouds',
    model: 'FLUX_SCHNELL',
    params: { ...demoParams, prompt: 'A friendly studio robot painting neon clouds', model: 'FLUX_SCHNELL' },
    createdAt: new Date(Date.now() - 1000 * 60 * 72).toISOString(),
    generationTime: 3.4,
    isFavorite: false,
  },
  {
    id: 'img-desert-observatory',
    url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    prompt: 'Desert observatory under a cinematic sunrise',
    model: 'SDXL',
    params: { ...demoParams, prompt: 'Desert observatory under a cinematic sunrise', model: 'SDXL' },
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    generationTime: 7.1,
    isFavorite: true,
  },
  {
    id: 'img-forest-portal',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=80',
    prompt: 'Ancient forest portal made of blue crystal',
    model: 'REALISTIC_VISION',
    params: { ...demoParams, prompt: 'Ancient forest portal made of blue crystal', model: 'REALISTIC_VISION' },
    createdAt: new Date(Date.now() - 1000 * 60 * 185).toISOString(),
    generationTime: 8.6,
    isFavorite: false,
  },
];
