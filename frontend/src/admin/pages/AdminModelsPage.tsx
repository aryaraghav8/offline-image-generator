import { useEffect, useState } from 'react';
import { Cpu, MoreVertical, RotateCw, Star, Trash2 } from 'lucide-react';
import { AdminPageHeader, AdminEmptyState, StatusPill, Toggle } from '@/admin/components/AdminPrimitives';
import { Skeleton } from '@/components/ui/AdvancedComponents';
import { Button } from '@/components/ui/BaseComponents';
import { useAppStore } from '@/stores/appStore';
import {
  fetchAdminModels,
  removeModel,
  setDefaultModel,
  setModelStatus,
  setModelVisibility,
} from '@/admin/services/adminApi';
import type { AdminModel, ModelStatus } from '@/admin/types';

const STATUS_TONE: Record<ModelStatus, 'success' | 'warning' | 'error' | 'neutral' | 'info'> = {
  active: 'success',
  installing: 'info',
  disabled: 'neutral',
  error: 'error',
  'not-installed': 'neutral',
};

const STATUS_LABEL: Record<ModelStatus, string> = {
  active: 'Active',
  installing: 'Installing',
  disabled: 'Disabled',
  error: 'Error',
  'not-installed': 'Not installed',
};

export const AdminModelsPage = () => {
  const [models, setModels] = useState<AdminModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const addToast = useAppStore((s) => s.addToast);

  useEffect(() => {
    fetchAdminModels().then((res) => {
      setModels(res);
      setLoading(false);
    });
  }, []);

  const handleVisibilityToggle = async (model: AdminModel, visible: boolean) => {
    setModels((prev) => prev.map((m) => (m.id === model.id ? { ...m, visibleToUsers: visible } : m)));
    await setModelVisibility(model.id, visible);
    addToast(`${model.displayName} is now ${visible ? 'visible to' : 'hidden from'} users`, 'success');
  };

  const handleSetDefault = async (model: AdminModel) => {
    const updated = await setDefaultModel(model.id);
    setModels(updated);
    addToast(`${model.displayName} is now the default model`, 'success');
    setOpenMenuId(null);
  };

  const handleRetry = async (model: AdminModel) => {
    setModels((prev) => prev.map((m) => (m.id === model.id ? { ...m, status: 'installing' } : m)));
    addToast(`Re-installing ${model.displayName}…`, 'info');
    const updated = await setModelStatus(model.id, 'active');
    setModels((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    addToast(`${model.displayName} is active again`, 'success');
    setOpenMenuId(null);
  };

  const handleRemove = async (model: AdminModel) => {
    setOpenMenuId(null);
    await removeModel(model.id);
    setModels((prev) => prev.filter((m) => m.id !== model.id));
    addToast(`${model.displayName} removed`, 'info');
  };

  return (
    <>
      <AdminPageHeader
        title="Models"
        description="Control which models end users can select in the generator, and which one loads by default."
      />

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20" count={4} />
        </div>
      ) : models.length === 0 ? (
        <AdminEmptyState icon={<Cpu size={28} />} title="No models configured" description="Connect a provider to bring in models." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-dark-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-dark-900/80 text-xs uppercase tracking-wider text-dark-500">
              <tr>
                <th className="px-5 py-3 font-medium">Model</th>
                <th className="px-5 py-3 font-medium">Provider</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">VRAM</th>
                <th className="px-5 py-3 font-medium">Usage</th>
                <th className="px-5 py-3 font-medium">Visible</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {models.map((model) => (
                <tr key={model.id} className="bg-dark-900/30 transition-colors hover:bg-dark-900/60">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{model.displayName}</span>
                      {model.isDefault && (
                        <span title="Default model">
                          <Star size={13} className="fill-ember-400 text-ember-400" />
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 max-w-sm truncate text-xs text-dark-500">{model.description}</p>
                  </td>
                  <td className="px-5 py-4 text-dark-400">{model.provider}</td>
                  <td className="px-5 py-4">
                    <StatusPill tone={STATUS_TONE[model.status]}>{STATUS_LABEL[model.status]}</StatusPill>
                  </td>
                  <td className="px-5 py-4 text-dark-400">{model.vram} GB</td>
                  <td className="px-5 py-4 text-dark-400">{model.usageCount.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <Toggle
                      checked={model.visibleToUsers}
                      onChange={(v) => handleVisibilityToggle(model, v)}
                      disabled={model.status === 'error' || model.status === 'installing'}
                    />
                  </td>
                  <td className="relative px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(openMenuId === model.id ? null : model.id)}
                      className="rounded-md p-1.5 text-dark-500 transition-colors hover:bg-dark-800 hover:text-white"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openMenuId === model.id && (
                      <div className="absolute right-5 top-12 z-10 w-44 overflow-hidden rounded-lg border border-dark-700 bg-dark-800 shadow-xl">
                        {model.status === 'active' && !model.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefault(model)}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-dark-200 hover:bg-dark-700"
                          >
                            <Star size={14} /> Set as default
                          </button>
                        )}
                        {model.status === 'error' && (
                          <button
                            type="button"
                            onClick={() => handleRetry(model)}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-dark-200 hover:bg-dark-700"
                          >
                            <RotateCw size={14} /> Retry install
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemove(model)}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-rose-400 hover:bg-dark-700"
                        >
                          <Trash2 size={14} /> Remove model
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="secondary" size="sm" disabled>
          Connect a new model source
        </Button>
      </div>
    </>
  );
};
