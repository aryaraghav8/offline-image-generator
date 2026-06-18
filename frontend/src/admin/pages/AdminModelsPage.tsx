import { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronRight,
  Cpu,
  Globe,
  HardDrive,
  Loader2,
  MoreVertical,
  Plus,
  RotateCw,
  Server,
  Star,
  Trash2,
  X,
} from 'lucide-react';
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
  addModelSource,
} from '@/admin/services/adminApi';
import type { AdminModel, ModelStatus, NewModelSource } from '@/admin/types';

// ─── Status helpers ───────────────────────────────────────────────────────────

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

// ─── Source type cards ────────────────────────────────────────────────────────

type SourceKind = 'api' | 'local' | 'huggingface';

interface SourceType {
  kind: SourceKind;
  label: string;
  description: string;
  icon: typeof Globe;
  color: string;
}

const SOURCE_TYPES: SourceType[] = [
  {
    kind: 'api',
    label: 'API Provider',
    description: 'Connect to a hosted generation API like Pollinations or OpenAI.',
    icon: Globe,
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  },
  {
    kind: 'local',
    label: 'Local Backend',
    description: 'Connect to ComfyUI, Stable Diffusion WebUI, or another local service.',
    icon: Server,
    color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
  {
    kind: 'huggingface',
    label: 'Hugging Face',
    description: 'Load a model directly from the Hugging Face model hub.',
    icon: HardDrive,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
];

// ─── Connect modal ────────────────────────────────────────────────────────────

interface ConnectModalProps {
  onClose: () => void;
  onAdded: (model: AdminModel) => void;
}

type Step = 'source' | 'details' | 'confirming';

const EMPTY_FORM = {
  displayName: '',
  baseUrl: '',
  apiKey: '',
  modelId: '',
  hfRepo: '',
  description: '',
  vram: '8',
};

const ConnectModal = ({ onClose, onAdded }: ConnectModalProps) => {
  const [step, setStep] = useState<Step>('source');
  const [selectedKind, setSelectedKind] = useState<SourceKind | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM>>({});
  const [submitting, setSubmitting] = useState(false);
  const addToast = useAppStore((s) => s.addToast);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const selectedSource = SOURCE_TYPES.find((s) => s.kind === selectedKind);

  const setField = (key: keyof typeof EMPTY_FORM, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validateDetails = (): boolean => {
    const next: Partial<typeof EMPTY_FORM> = {};
    if (!form.displayName.trim()) next.displayName = 'Name is required';
    if (selectedKind !== 'huggingface' && !form.baseUrl.trim()) next.baseUrl = 'Base URL is required';
    if (selectedKind === 'huggingface' && !form.hfRepo.trim())
      next.hfRepo = 'Repository is required (e.g. stabilityai/stable-diffusion-xl-base-1.0)';
    if (selectedKind !== 'local' && !form.apiKey.trim()) next.apiKey = 'API key is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (step === 'source' && selectedKind) setStep('details');
    else if (step === 'details' && validateDetails()) handleSubmit();
  };

  const handleSubmit = async () => {
    setStep('confirming');
    setSubmitting(true);
    try {
      const payload: NewModelSource = {
        kind: selectedKind!,
        displayName: form.displayName.trim(),
        description: form.description.trim(),
        baseUrl: form.baseUrl.trim(),
        apiKey: form.apiKey.trim(),
        modelId: form.modelId.trim(),
        hfRepo: form.hfRepo.trim(),
        vram: parseInt(form.vram) || 8,
      };
      const newModel = await addModelSource(payload);
      addToast(`${newModel.displayName} added successfully`, 'success');
      onAdded(newModel);
      onClose();
    } catch {
      addToast('Failed to add model source', 'error');
      setStep('details');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-dark-700 bg-dark-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-700 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-white">Connect a model source</h2>
            <p className="mt-0.5 text-xs text-dark-500">
              {step === 'source' && 'Choose how you want to connect a model'}
              {step === 'details' && `Configure ${selectedSource?.label}`}
              {step === 'confirming' && 'Adding model…'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-dark-500 transition-colors hover:bg-dark-800 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 border-b border-dark-700 px-6 py-3">
          {(['source', 'details', 'confirming'] as Step[]).map((s, i) => {
            const reached = (['source', 'details', 'confirming'] as Step[]).indexOf(step) >= i;
            return (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                    reached ? 'bg-indigo-500 text-white' : 'bg-dark-800 text-dark-500'
                  }`}
                >
                  {i + 1}
                </div>
                <span className={`text-xs capitalize ${reached ? 'text-dark-200' : 'text-dark-600'}`}>
                  {s === 'confirming' ? 'Confirm' : s}
                </span>
                {i < 2 && <ChevronRight size={12} className="text-dark-700" />}
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Step 1 — source type */}
          {step === 'source' && (
            <div className="space-y-3">
              {SOURCE_TYPES.map((src) => {
                const Icon = src.icon;
                const active = selectedKind === src.kind;
                return (
                  <button
                    key={src.kind}
                    type="button"
                    onClick={() => setSelectedKind(src.kind)}
                    className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all ${
                      active
                        ? 'border-indigo-500/50 bg-indigo-500/10'
                        : 'border-dark-700 bg-dark-800/50 hover:border-dark-600 hover:bg-dark-800'
                    }`}
                  >
                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border ${src.color}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{src.label}</p>
                      <p className="mt-0.5 text-xs text-dark-500">{src.description}</p>
                    </div>
                    <div
                      className={`mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border transition-all ${
                        active ? 'border-indigo-500 bg-indigo-500' : 'border-dark-600'
                      }`}
                    >
                      {active && <Check size={10} className="text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 2 — details form */}
          {step === 'details' && (
            <div className="space-y-4">
              <Field
                label="Display Name"
                placeholder="e.g. My Custom Flux"
                value={form.displayName}
                onChange={(v) => setField('displayName', v)}
                error={errors.displayName}
                required
              />
              {selectedKind !== 'huggingface' && (
                <Field
                  label="Base URL"
                  placeholder={
                    selectedKind === 'api'
                      ? 'https://gen.pollinations.ai/v1'
                      : 'http://127.0.0.1:8188'
                  }
                  value={form.baseUrl}
                  onChange={(v) => setField('baseUrl', v)}
                  error={errors.baseUrl}
                  required
                />
              )}
              {selectedKind === 'huggingface' && (
                <Field
                  label="HuggingFace Repository"
                  placeholder="stabilityai/stable-diffusion-xl-base-1.0"
                  value={form.hfRepo}
                  onChange={(v) => setField('hfRepo', v)}
                  error={errors.hfRepo}
                  required
                />
              )}
              {selectedKind !== 'local' && (
                <Field
                  label="API Key"
                  placeholder="Paste your key here"
                  value={form.apiKey}
                  onChange={(v) => setField('apiKey', v)}
                  error={errors.apiKey}
                  secret
                  required
                />
              )}
              {selectedKind !== 'huggingface' && (
                <Field
                  label="Model ID"
                  placeholder="e.g. flux, sdxl-turbo"
                  value={form.modelId}
                  onChange={(v) => setField('modelId', v)}
                  hint="The model identifier the provider uses. Leave blank to use provider default."
                />
              )}
              <Field
                label="Description"
                placeholder="Short description (optional)"
                value={form.description}
                onChange={(v) => setField('description', v)}
              />
              <div>
                <label className="mb-1.5 block text-xs font-medium text-dark-300">
                  VRAM Required (GB)
                </label>
                <select
                  value={form.vram}
                  onChange={(e) => setField('vram', e.target.value)}
                  className="w-full rounded-xl border border-dark-700 bg-dark-800 px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                >
                  {[4, 6, 8, 10, 12, 16, 24].map((v) => (
                    <option key={v} value={v}>{v} GB</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 3 — confirming */}
          {step === 'confirming' && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Loader2 size={36} className="mb-4 animate-spin text-indigo-400" />
              <p className="text-sm font-medium text-white">Connecting model source…</p>
              <p className="mt-1 text-xs text-dark-500">
                Testing connection and registering {form.displayName}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'confirming' && (
          <div className="flex items-center justify-between border-t border-dark-700 px-6 py-4">
            <button
              type="button"
              onClick={step === 'source' ? onClose : () => setStep('source')}
              className="text-sm text-dark-400 transition-colors hover:text-white"
            >
              {step === 'source' ? 'Cancel' : '← Back'}
            </button>
            <Button
              size="sm"
              onClick={handleNext}
              disabled={step === 'source' && !selectedKind}
              isLoading={submitting}
            >
              {step === 'details' ? 'Add Model' : 'Next'}
              {step === 'source' && <ChevronRight size={15} />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Small reusable field ─────────────────────────────────────────────────────

const Field = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  hint,
  secret,
  required,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  secret?: boolean;
  required?: boolean;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-dark-300">
        {label}
        {required && <span className="ml-1 text-rose-400">*</span>}
      </label>
      <div className="relative">
        <input
          type={secret && !show ? 'password' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border bg-dark-800 px-3 py-2.5 text-sm text-white placeholder:text-dark-600 focus:outline-none focus:ring-1 ${
            error
              ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/30'
              : 'border-dark-700 focus:border-indigo-500 focus:ring-indigo-500/30'
          } ${secret ? 'pr-10' : ''}`}
        />
        {secret && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-dark-500 hover:text-dark-300"
          >
            {show ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-dark-500">{hint}</p>}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

export const AdminModelsPage = () => {
  const [models, setModels] = useState<AdminModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
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

  const handleModelAdded = (model: AdminModel) => {
    setModels((prev) => [model, ...prev]);
  };

  return (
    <>
      <AdminPageHeader
        title="Models"
        description="Control which models end users can select in the generator, and which one loads by default."
        actions={
          <Button size="sm" onClick={() => setShowConnectModal(true)}>
            <Plus size={15} />
            Connect model source
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20" count={4} />
        </div>
      ) : models.length === 0 ? (
        <AdminEmptyState
          icon={<Cpu size={28} />}
          title="No models configured"
          description="Connect a provider to bring in models."
          action={
            <Button size="sm" onClick={() => setShowConnectModal(true)}>
              <Plus size={15} />
              Connect model source
            </Button>
          }
        />
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
                          <Star size={13} className="fill-amber-400 text-amber-400" />
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

      {showConnectModal && (
        <ConnectModal
          onClose={() => setShowConnectModal(false)}
          onAdded={handleModelAdded}
        />
      )}
    </>
  );
};
