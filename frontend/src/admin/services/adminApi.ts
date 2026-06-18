import type {
  AdminModel,
  AdminProvider,
  AdminTemplate,
  StorageOverview,
  SystemOverview,
  AdminDashboardOverview,
  NewModelSource,
} from '@/admin/types';

const ADMIN_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api')
  .replace(/\/api$/, '/api/admin');

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${ADMIN_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Admin API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ─── Models ─────────────────────────────────────────────────────────────────

export async function fetchAdminModels(): Promise<AdminModel[]> {
  return apiFetch<AdminModel[]>('/models');
}

export async function setModelVisibility(id: string, visible: boolean): Promise<AdminModel> {
  return apiFetch<AdminModel>(`/models/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ visibleToUsers: visible }),
  });
}

export async function setModelStatus(id: string, status: AdminModel['status']): Promise<AdminModel> {
  return apiFetch<AdminModel>(`/models/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function setDefaultModel(id: string): Promise<AdminModel[]> {
  return apiFetch<AdminModel[]>(`/models/${id}/set-default`, { method: 'POST' });
}

export async function removeModel(id: string): Promise<void> {
  await apiFetch<void>(`/models/${id}`, { method: 'DELETE' });
}

export async function addModelSource(source: NewModelSource): Promise<AdminModel> {
  return apiFetch<AdminModel>('/models', {
    method: 'POST',
    body: JSON.stringify(source),
  });
}

// ─── Providers ──────────────────────────────────────────────────────────────

export async function fetchAdminProviders(): Promise<AdminProvider[]> {
  return apiFetch<AdminProvider[]>('/providers');
}

export async function testProviderConnection(id: string): Promise<AdminProvider> {
  return apiFetch<AdminProvider>(`/providers/${id}/test`, { method: 'POST' });
}

export async function setProviderApiKey(id: string, key: string): Promise<AdminProvider> {
  return apiFetch<AdminProvider>(`/providers/${id}/api-key`, {
    method: 'PUT',
    body: JSON.stringify({ apiKey: key }),
  });
}

// ─── Templates ──────────────────────────────────────────────────────────────

export async function fetchAdminTemplates(): Promise<AdminTemplate[]> {
  return apiFetch<AdminTemplate[]>('/templates');
}

export async function saveTemplate(template: AdminTemplate): Promise<AdminTemplate> {
  const method = template.id ? 'PUT' : 'POST';
  const path   = template.id ? `/templates/${template.id}` : '/templates';
  return apiFetch<AdminTemplate>(path, { method, body: JSON.stringify(template) });
}

export async function deleteTemplate(id: string): Promise<void> {
  await apiFetch<void>(`/templates/${id}`, { method: 'DELETE' });
}

export async function setTemplatePublished(id: string, published: boolean): Promise<AdminTemplate> {
  return apiFetch<AdminTemplate>(`/templates/${id}/publish`, {
    method: 'PATCH',
    body: JSON.stringify({ published }),
  });
}

// ─── Storage ────────────────────────────────────────────────────────────────

export async function fetchStorageOverview(): Promise<StorageOverview> {
  return apiFetch<StorageOverview>('/storage');
}

export async function updateRetentionPolicy(days: number, autoCleanup: boolean): Promise<StorageOverview> {
  return apiFetch<StorageOverview>('/storage/policy', {
    method: 'PUT',
    body: JSON.stringify({ retentionDays: days, autoCleanupEnabled: autoCleanup }),
  });
}

export async function runCleanupNow(): Promise<StorageOverview> {
  return apiFetch<StorageOverview>('/storage/cleanup', { method: 'POST' });
}

// ─── System ─────────────────────────────────────────────────────────────────

export async function fetchSystemOverview(): Promise<SystemOverview> {
  return apiFetch<SystemOverview>('/system');
}

export async function restartService(id: string): Promise<SystemOverview> {
  return apiFetch<SystemOverview>('/system/restart', {
    method: 'POST',
    body: JSON.stringify({ serviceId: id }),
  });
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

export async function fetchAdminDashboard(): Promise<AdminDashboardOverview> {
  return apiFetch<AdminDashboardOverview>('/dashboard');
}
