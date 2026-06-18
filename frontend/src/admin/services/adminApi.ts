import type {
  AdminModel,
  AdminProvider,
  AdminTemplate,
  StorageOverview,
  SystemOverview,
  AdminDashboardOverview,
} from '@/admin/types';

// ─────────────────────────────────────────────────────────────────────────
// This module is the single seam between the Admin UI and its data source.
// Every export currently resolves from in-memory mock data behind an
// artificial delay so loading states are visible. To wire up a real
// backend later: replace the body of each function with an axios/fetch
// call (e.g. apiClient.get('/admin/models')) and keep the same return
// shape — no page component needs to change.
// ─────────────────────────────────────────────────────────────────────────

function delay<T>(value: T, ms = 420): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// ─── Models ─────────────────────────────────────────────────────────────

let modelsDb: AdminModel[] = [
  {
    id: 'flux',
    displayName: 'Flux Dev',
    slug: 'flux',
    description: 'State-of-the-art text-to-image model with excellent prompt adherence and photorealism.',
    provider: 'Pollinations',
    category: 'text-to-image',
    status: 'active',
    size: '23.8 GB',
    vram: 24,
    visibleToUsers: true,
    isDefault: true,
    usageCount: 4821,
    lastUsed: '2 hours ago',
    addedAt: '2026-02-11T10:00:00Z',
    version: '1.0',
  },
  {
    id: 'flux-schnell',
    displayName: 'Flux Schnell',
    slug: 'flux-schnell',
    description: 'Fast Flux variant optimized for rapid iteration with strong visual quality.',
    provider: 'Pollinations',
    category: 'text-to-image',
    status: 'active',
    size: '23.8 GB',
    vram: 16,
    visibleToUsers: true,
    isDefault: false,
    usageCount: 3104,
    lastUsed: '1 hour ago',
    addedAt: '2026-02-11T10:00:00Z',
    version: '1.0',
  },
  {
    id: 'sdxl',
    displayName: 'Stable Diffusion XL',
    slug: 'stable-diffusion-xl',
    description: 'High-resolution general model with strong composition and broad style coverage.',
    provider: 'Local · ComfyUI',
    category: 'text-to-image',
    status: 'active',
    size: '6.5 GB',
    vram: 10,
    visibleToUsers: true,
    isDefault: false,
    usageCount: 2210,
    lastUsed: '3 hours ago',
    addedAt: '2026-03-02T10:00:00Z',
    version: '1.0',
  },
  {
    id: 'sd-1-5',
    displayName: 'Stable Diffusion 1.5',
    slug: 'stable-diffusion-1-5',
    description: 'Classic lightweight model with broad community fine-tune support.',
    provider: 'Local · ComfyUI',
    category: 'text-to-image',
    status: 'disabled',
    size: '2.0 GB',
    vram: 6,
    visibleToUsers: false,
    isDefault: false,
    usageCount: 980,
    lastUsed: '1 day ago',
    addedAt: '2026-01-20T10:00:00Z',
    version: '1.5',
  },
  {
    id: 'realistic-vision',
    displayName: 'Realistic Vision v6',
    slug: 'realistic-vision',
    description: 'Fine-tuned model specializing in realistic portraits and lifestyle photography.',
    provider: 'Local · ComfyUI',
    category: 'text-to-image',
    status: 'installing',
    size: '2.0 GB',
    vram: 8,
    visibleToUsers: false,
    isDefault: false,
    usageCount: 0,
    lastUsed: null,
    addedAt: '2026-06-17T08:00:00Z',
    version: '6.0',
  },
  {
    id: 'real-esrgan',
    displayName: 'Real-ESRGAN x4',
    slug: 'real-esrgan-x4',
    description: 'Upscaling model for sharpening and enlarging generated output.',
    provider: 'Local · ComfyUI',
    category: 'upscaler',
    status: 'error',
    size: '340 MB',
    vram: 4,
    visibleToUsers: false,
    isDefault: false,
    usageCount: 412,
    lastUsed: '6 days ago',
    addedAt: '2026-01-05T10:00:00Z',
    version: '0.3',
  },
];

export async function fetchAdminModels(): Promise<AdminModel[]> {
  return delay([...modelsDb]);
}

export async function setModelVisibility(id: string, visible: boolean): Promise<AdminModel> {
  modelsDb = modelsDb.map((m) => (m.id === id ? { ...m, visibleToUsers: visible } : m));
  return delay(modelsDb.find((m) => m.id === id)!, 200);
}

export async function setModelStatus(id: string, status: AdminModel['status']): Promise<AdminModel> {
  modelsDb = modelsDb.map((m) => (m.id === id ? { ...m, status } : m));
  return delay(modelsDb.find((m) => m.id === id)!, 200);
}

export async function setDefaultModel(id: string): Promise<AdminModel[]> {
  modelsDb = modelsDb.map((m) => ({ ...m, isDefault: m.id === id }));
  return delay([...modelsDb], 200);
}

export async function removeModel(id: string): Promise<void> {
  modelsDb = modelsDb.filter((m) => m.id !== id);
  return delay(undefined, 200);
}

// ─── Providers ──────────────────────────────────────────────────────────

let providersDb: AdminProvider[] = [
  {
    id: 'pollinations',
    name: 'Pollinations',
    kind: 'api',
    description: 'Default hosted generation API used for Flux models.',
    status: 'connected',
    baseUrl: 'https://gen.pollinations.ai/v1',
    hasApiKey: true,
    modelsSupplied: 2,
    requestsToday: 318,
    lastChecked: '5 minutes ago',
    monthlySpend: 42.6,
    monthlyBudget: 100,
  },
  {
    id: 'comfyui',
    name: 'ComfyUI',
    kind: 'local',
    description: 'Local node-based Stable Diffusion backend running on this machine.',
    status: 'connected',
    baseUrl: 'http://127.0.0.1:8188',
    hasApiKey: false,
    modelsSupplied: 4,
    requestsToday: 96,
    lastChecked: '5 minutes ago',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    kind: 'api',
    description: 'Optional provider for DALL·E-class generation, currently unused.',
    status: 'disconnected',
    baseUrl: 'https://api.openai.com/v1',
    hasApiKey: false,
    modelsSupplied: 0,
    requestsToday: 0,
    lastChecked: null,
  },
  {
    id: 'huggingface',
    name: 'Hugging Face Inference',
    kind: 'api',
    description: 'Fallback provider for community-hosted checkpoints.',
    status: 'error',
    baseUrl: 'https://api-inference.huggingface.co',
    hasApiKey: true,
    modelsSupplied: 0,
    requestsToday: 0,
    lastChecked: '2 hours ago',
    monthlySpend: 0,
    monthlyBudget: 25,
  },
];

export async function fetchAdminProviders(): Promise<AdminProvider[]> {
  return delay([...providersDb]);
}

export async function testProviderConnection(id: string): Promise<AdminProvider> {
  await delay(undefined, 700);
  providersDb = providersDb.map((p) =>
    p.id === id ? { ...p, status: p.hasApiKey || p.kind === 'local' ? 'connected' : 'error', lastChecked: 'Just now' } : p
  );
  return providersDb.find((p) => p.id === id)!;
}

export async function setProviderApiKey(id: string, key: string): Promise<AdminProvider> {
  providersDb = providersDb.map((p) =>
    p.id === id ? { ...p, hasApiKey: key.trim().length > 0 } : p
  );
  return delay(providersDb.find((p) => p.id === id)!, 250);
}

// ─── Templates ──────────────────────────────────────────────────────────

let templatesDb: AdminTemplate[] = [
  {
    id: 'tpl-cinematic',
    name: 'Cinematic Portrait',
    category: 'Portrait',
    description: 'Dramatic lighting, shallow depth of field, film-still composition.',
    content: 'cinematic portrait of {subject}, dramatic rim lighting, shallow depth of field, anamorphic lens, film grain, 35mm',
    published: true,
    usageCount: 612,
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-05-12T14:20:00Z',
    author: 'Aditya',
  },
  {
    id: 'tpl-isometric',
    name: 'Isometric Room',
    category: 'Illustration',
    description: 'Clean isometric interior scenes for product or game art.',
    content: 'isometric illustration of {subject}, soft pastel palette, clean vector shading, miniature diorama style',
    published: true,
    usageCount: 388,
    createdAt: '2026-03-04T09:00:00Z',
    updatedAt: '2026-04-02T11:00:00Z',
    author: 'Aditya',
  },
  {
    id: 'tpl-product',
    name: 'Studio Product Shot',
    category: 'Product',
    description: 'Neutral background product photography with soft studio lighting.',
    content: 'studio product photo of {subject}, seamless white background, soft box lighting, high detail, commercial photography',
    published: true,
    usageCount: 901,
    createdAt: '2026-02-18T09:00:00Z',
    updatedAt: '2026-06-01T08:40:00Z',
    author: 'Aditya',
  },
  {
    id: 'tpl-concept',
    name: 'Sci-fi Concept Art',
    category: 'Concept Art',
    description: 'Wide environment concept art with atmospheric depth.',
    content: 'sci-fi concept art of {subject}, atmospheric depth, volumetric lighting, matte painting, wide angle',
    published: false,
    usageCount: 47,
    createdAt: '2026-06-10T09:00:00Z',
    updatedAt: '2026-06-10T09:00:00Z',
    author: 'Aditya',
  },
];

export async function fetchAdminTemplates(): Promise<AdminTemplate[]> {
  return delay([...templatesDb]);
}

export async function saveTemplate(template: AdminTemplate): Promise<AdminTemplate> {
  const exists = templatesDb.some((t) => t.id === template.id);
  templatesDb = exists
    ? templatesDb.map((t) => (t.id === template.id ? template : t))
    : [template, ...templatesDb];
  return delay(template, 250);
}

export async function deleteTemplate(id: string): Promise<void> {
  templatesDb = templatesDb.filter((t) => t.id !== id);
  return delay(undefined, 200);
}

export async function setTemplatePublished(id: string, published: boolean): Promise<AdminTemplate> {
  templatesDb = templatesDb.map((t) => (t.id === id ? { ...t, published } : t));
  return delay(templatesDb.find((t) => t.id === id)!, 200);
}

// ─── Storage ────────────────────────────────────────────────────────────

const storageDb: StorageOverview = {
  totalCapacityBytes: 500 * 1024 ** 3,
  usedBytes: 184 * 1024 ** 3,
  buckets: [
    { id: 'outputs', label: 'Generated Images', path: '/data/outputs', usedBytes: 92 * 1024 ** 3, fileCount: 18420 },
    { id: 'models', label: 'Model Weights', path: '/data/models', usedBytes: 78 * 1024 ** 3, fileCount: 6 },
    { id: 'thumbnails', label: 'Thumbnails', path: '/data/thumbnails', usedBytes: 9 * 1024 ** 3, fileCount: 18420 },
    { id: 'logs', label: 'Logs & Metrics', path: '/data/logs', usedBytes: 5 * 1024 ** 3, fileCount: 312 },
  ],
  retentionDays: 90,
  autoCleanupEnabled: true,
  lastCleanupAt: '2026-06-17T03:00:00Z',
};

export async function fetchStorageOverview(): Promise<StorageOverview> {
  return delay({ ...storageDb, buckets: [...storageDb.buckets] });
}

export async function updateRetentionPolicy(days: number, autoCleanup: boolean): Promise<StorageOverview> {
  storageDb.retentionDays = days;
  storageDb.autoCleanupEnabled = autoCleanup;
  return delay({ ...storageDb, buckets: [...storageDb.buckets] }, 250);
}

export async function runCleanupNow(): Promise<StorageOverview> {
  await delay(undefined, 900);
  storageDb.lastCleanupAt = new Date().toISOString();
  storageDb.usedBytes = Math.max(storageDb.usedBytes - 4 * 1024 ** 3, 0);
  return { ...storageDb, buckets: [...storageDb.buckets] };
}

// ─── System ─────────────────────────────────────────────────────────────

const systemDb: SystemOverview = {
  services: [
    { id: 'api', name: 'API Server', description: 'FastAPI application server', state: 'healthy', uptime: '4d 7h', version: '1.4.2' },
    { id: 'queue', name: 'Generation Queue', description: 'Background job worker', state: 'healthy', uptime: '4d 7h', version: '1.4.2' },
    { id: 'comfyui', name: 'ComfyUI Backend', description: 'Local diffusion backend', state: 'degraded', uptime: '1d 2h', version: '0.3.9' },
    { id: 'storage', name: 'Storage Service', description: 'File and metadata storage', state: 'healthy', uptime: '4d 7h', version: '1.4.2' },
  ],
  cpuUsage: 38,
  memoryUsage: 62,
  memoryTotalGb: 32,
  gpuUsage: 71,
  apiVersion: '1.4.2',
  environment: 'production',
  logs: [
    { id: 'log-1', level: 'info', message: 'Generation completed for job a812f', source: 'queue', timestamp: '2026-06-18T09:42:00Z' },
    { id: 'log-2', level: 'warning', message: 'ComfyUI response time exceeded 8s threshold', source: 'comfyui', timestamp: '2026-06-18T09:38:00Z' },
    { id: 'log-3', level: 'info', message: 'Model "flux-schnell" cache warmed', source: 'api', timestamp: '2026-06-18T09:20:00Z' },
    { id: 'log-4', level: 'error', message: 'Provider "huggingface" auth check failed: 401', source: 'providers', timestamp: '2026-06-18T07:55:00Z' },
    { id: 'log-5', level: 'info', message: 'Nightly storage cleanup completed, freed 4.0 GB', source: 'storage', timestamp: '2026-06-18T03:00:00Z' },
  ],
};

export async function fetchSystemOverview(): Promise<SystemOverview> {
  return delay({ ...systemDb, services: [...systemDb.services], logs: [...systemDb.logs] });
}

export async function restartService(id: string): Promise<SystemOverview> {
  await delay(undefined, 900);
  const services = systemDb.services.map((s) => (s.id === id ? { ...s, state: 'healthy' as const, uptime: '0m' } : s));
  return { ...systemDb, services, logs: [...systemDb.logs] };
}

// ─── Dashboard ──────────────────────────────────────────────────────────

const dashboardDb: AdminDashboardOverview = {
  totalGenerationsToday: 318,
  totalGenerationsAllTime: 48213,
  activeModels: modelsDb.filter((m) => m.status === 'active').length,
  connectedProviders: 2,
  failureRate24h: 1.8,
  avgGenerationTimeSec: 6.4,
  generationsTrend: [
    { label: 'Mon', value: 412 },
    { label: 'Tue', value: 528 },
    { label: 'Wed', value: 374 },
    { label: 'Thu', value: 601 },
    { label: 'Fri', value: 489 },
    { label: 'Sat', value: 712 },
    { label: 'Sun', value: 318 },
  ],
  recentActivity: [
    { id: 'act-1', actor: 'Aditya', action: 'enabled', target: 'Stable Diffusion XL', timestamp: '12 minutes ago' },
    { id: 'act-2', actor: 'System', action: 'flagged', target: 'Hugging Face provider (auth error)', timestamp: '2 hours ago' },
    { id: 'act-3', actor: 'Aditya', action: 'published', target: 'Studio Product Shot template', timestamp: '5 hours ago' },
    { id: 'act-4', actor: 'System', action: 'completed cleanup, freed', target: '4.0 GB', timestamp: 'Today at 03:00' },
    { id: 'act-5', actor: 'Aditya', action: 'set default model to', target: 'Flux Dev', timestamp: 'Yesterday' },
  ],
};

export async function fetchAdminDashboard(): Promise<AdminDashboardOverview> {
  return delay({ ...dashboardDb, generationsTrend: [...dashboardDb.generationsTrend], recentActivity: [...dashboardDb.recentActivity] });
}
