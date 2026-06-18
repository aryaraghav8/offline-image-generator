// ─── Admin: Models ──────────────────────────────────────────────────────────
// Distinct from the user-facing Model type in @/types — this is the
// management record an operator uses to install, configure, and retire
// the models end users will see in the picker.

export type ModelStatus = 'active' | 'installing' | 'disabled' | 'error' | 'not-installed';

export interface AdminModel {
  id: string;
  displayName: string;
  slug: string;
  description: string;
  provider: string; // e.g. "Local · ComfyUI", "Pollinations"
  category: 'text-to-image' | 'image-to-image' | 'upscaler';
  status: ModelStatus;
  size: string;
  vram: number;
  visibleToUsers: boolean;
  isDefault: boolean;
  usageCount: number;
  lastUsed: string | null;
  addedAt: string;
  version: string;
}

// ─── Admin: Providers ───────────────────────────────────────────────────────

export type ProviderStatus = 'connected' | 'disconnected' | 'error' | 'untested';

export interface AdminProvider {
  id: string;
  name: string;
  kind: 'api' | 'local';
  description: string;
  status: ProviderStatus;
  baseUrl: string;
  hasApiKey: boolean;
  modelsSupplied: number;
  requestsToday: number;
  lastChecked: string | null;
  monthlySpend?: number;
  monthlyBudget?: number;
}

// ─── Admin: Prompt Templates ────────────────────────────────────────────────

export interface AdminTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  content: string;
  published: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  author: string;
}

// ─── Admin: Storage ─────────────────────────────────────────────────────────

export interface StorageBucket {
  id: string;
  label: string;
  path: string;
  usedBytes: number;
  fileCount: number;
}

export interface StorageOverview {
  totalCapacityBytes: number;
  usedBytes: number;
  buckets: StorageBucket[];
  retentionDays: number;
  autoCleanupEnabled: boolean;
  lastCleanupAt: string | null;
}

// ─── Admin: System ──────────────────────────────────────────────────────────

export type ServiceState = 'healthy' | 'degraded' | 'down';

export interface SystemService {
  id: string;
  name: string;
  description: string;
  state: ServiceState;
  uptime: string;
  version: string;
}

export interface SystemLogEntry {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  source: string;
  timestamp: string;
}

export interface SystemOverview {
  services: SystemService[];
  cpuUsage: number;
  memoryUsage: number;
  memoryTotalGb: number;
  gpuUsage: number | null;
  apiVersion: string;
  environment: 'development' | 'staging' | 'production';
  logs: SystemLogEntry[];
}

// ─── Admin: Dashboard ───────────────────────────────────────────────────────

export interface AdminStatPoint {
  label: string;
  value: number;
}

export interface AdminDashboardOverview {
  totalGenerationsToday: number;
  totalGenerationsAllTime: number;
  activeModels: number;
  connectedProviders: number;
  failureRate24h: number;
  avgGenerationTimeSec: number;
  generationsTrend: AdminStatPoint[];
  recentActivity: Array<{
    id: string;
    actor: string;
    action: string;
    target: string;
    timestamp: string;
  }>;
}
