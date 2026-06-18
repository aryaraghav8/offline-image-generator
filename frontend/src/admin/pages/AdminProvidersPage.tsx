import { useEffect, useState } from 'react';
import { Eye, EyeOff, Plug, RefreshCw } from 'lucide-react';
import { AdminPageHeader, AdminPanel, AdminProgressBar, StatusPill } from '@/admin/components/AdminPrimitives';
import { Skeleton } from '@/components/ui/AdvancedComponents';
import { Button, Input } from '@/components/ui/BaseComponents';
import { useAppStore } from '@/stores/appStore';
import { fetchAdminProviders, setProviderApiKey, testProviderConnection } from '@/admin/services/adminApi';
import type { AdminProvider, ProviderStatus } from '@/admin/types';
import { parseErrorMessage } from '@/utils';

const STATUS_TONE: Record<ProviderStatus, 'success' | 'warning' | 'error' | 'neutral' | 'info'> = {
  connected: 'success',
  disconnected: 'neutral',
  error: 'error',
  untested: 'warning',
};

const STATUS_LABEL: Record<ProviderStatus, string> = {
  connected: 'Connected',
  disconnected: 'Disconnected',
  error: 'Error',
  untested: 'Untested',
};

export const AdminProvidersPage = () => {
  const [providers, setProviders] = useState<AdminProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [keyDrafts, setKeyDrafts] = useState<Record<string, string>>({});
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const addToast = useAppStore((s) => s.addToast);

  useEffect(() => {
    fetchAdminProviders().then((res) => {
      setProviders(res);
      setLoading(false);
    });
  }, []);

  const handleTest = async (provider: AdminProvider) => {
    setTestingId(provider.id);
    try {
      const updated = await testProviderConnection(provider.id);
      setProviders((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      addToast(
        updated.status === 'connected' ? `${provider.name} connected successfully` : `${provider.name} failed to connect`,
        updated.status === 'connected' ? 'success' : 'error'
      );
    } catch (err) {
      addToast(parseErrorMessage(err), 'error');
    } finally {
      setTestingId(null);
    }
  };

  const handleSaveKey = async (provider: AdminProvider) => {
    const key = keyDrafts[provider.id] ?? '';
    const updated = await setProviderApiKey(provider.id, key);
    setProviders((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    addToast(`API key updated for ${provider.name}`, 'success');
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <>
      <AdminPageHeader
        title="Providers"
        description="Connect and configure the generation backends models are served from."
      />

      {loading ? (
        <Skeleton className="h-40" count={4} />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {providers.map((provider) => (
            <AdminPanel key={provider.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Plug size={16} className="text-dark-500" />
                    <h3 className="font-semibold text-white">{provider.name}</h3>
                    <span className="rounded-full bg-dark-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-dark-400">
                      {provider.kind === 'local' ? 'Local' : 'API'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-dark-400">{provider.description}</p>
                </div>
                <StatusPill tone={STATUS_TONE[provider.status]}>{STATUS_LABEL[provider.status]}</StatusPill>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-dark-800 p-2.5">
                  <p className="text-dark-500">Base URL</p>
                  <p className="mt-0.5 truncate font-medium text-dark-200" title={provider.baseUrl}>
                    {provider.baseUrl}
                  </p>
                </div>
                <div className="rounded-lg bg-dark-800 p-2.5">
                  <p className="text-dark-500">Models supplied</p>
                  <p className="mt-0.5 font-medium text-dark-200">{provider.modelsSupplied}</p>
                </div>
                <div className="rounded-lg bg-dark-800 p-2.5">
                  <p className="text-dark-500">Requests today</p>
                  <p className="mt-0.5 font-medium text-dark-200">{provider.requestsToday.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-dark-800 p-2.5">
                  <p className="text-dark-500">Last checked</p>
                  <p className="mt-0.5 font-medium text-dark-200">{provider.lastChecked ?? 'Never'}</p>
                </div>
              </div>

              {provider.monthlyBudget !== undefined && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-dark-500">
                    <span>Monthly spend</span>
                    <span>
                      ${provider.monthlySpend?.toFixed(2)} / ${provider.monthlyBudget.toFixed(2)}
                    </span>
                  </div>
                  <AdminProgressBar
                    value={provider.monthlySpend ?? 0}
                    max={provider.monthlyBudget}
                    tone={(provider.monthlySpend ?? 0) / provider.monthlyBudget > 0.8 ? 'warning' : 'ember'}
                    className="mt-1.5"
                  />
                </div>
              )}

              {provider.kind === 'api' && (
                <div className="mt-4 flex items-end gap-2">
                  <Input
                    label="API key"
                    type={revealedIds.has(provider.id) ? 'text' : 'password'}
                    placeholder={provider.hasApiKey ? '•••••••••••••••• (set)' : 'Enter API key'}
                    value={keyDrafts[provider.id] ?? ''}
                    onChange={(e) => setKeyDrafts((prev) => ({ ...prev, [provider.id]: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => toggleReveal(provider.id)}
                    className="mb-0.5 rounded-lg border border-dark-700 p-2.5 text-dark-500 transition-colors hover:text-white"
                  >
                    {revealedIds.has(provider.id) ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              )}

              <div className="mt-4 flex justify-between gap-2">
                {provider.kind === 'api' && (
                  <Button variant="secondary" size="sm" onClick={() => handleSaveKey(provider)}>
                    Save key
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  isLoading={testingId === provider.id}
                  onClick={() => handleTest(provider)}
                  className="ml-auto"
                >
                  <RefreshCw size={14} />
                  Test connection
                </Button>
              </div>
            </AdminPanel>
          ))}
        </div>
      )}
    </>
  );
};
