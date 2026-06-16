import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Award,
  CheckCircle,
  Clock,
  Cpu,
  HardDrive,
  RefreshCw,
  Star,
  Zap,
} from 'lucide-react';

import type { Model } from '@/types';
import { apiClient } from '@/services/api';
import { useAppStore } from '@/stores/appStore';

const PERF_CONFIG: Record<
  Model['performance'],
  {
    label: string;
    color: string;
    icon: LucideIcon;
  }
> = {
  fast: {
    label: 'Fast',
    color:
      'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    icon: Zap,
  },
  balanced: {
    label: 'Balanced',
    color:
      'text-amber-400 bg-amber-500/10 border-amber-500/20',
    icon: Star,
  },
  'high-quality': {
    label: 'Quality',
    color:
      'text-violet-400 bg-violet-500/10 border-violet-500/20',
    icon: Award,
  },
};

const ModelCard = ({ model }: { model: Model }) => {
  const perf = PERF_CONFIG[model.performance];
  const PerfIcon = perf.icon;

  return (
    <article className="card-hover rounded-2xl border border-dark-700 bg-dark-800 p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
          <Cpu
            size={22}
            className="text-indigo-400"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h2 className="text-base font-semibold text-white">
              {model.displayName}
            </h2>

            <span
              className={`flex flex-shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${perf.color}`}
            >
              <PerfIcon size={11} />
              {perf.label}
            </span>
          </div>

          <p className="mb-3 text-sm leading-relaxed text-dark-300">
            {model.description}
          </p>

          <div className="mb-3 flex flex-wrap gap-1.5">
            {[
              model.category,
              `${model.vram}GB VRAM`,
              `${model.quality}% quality`,
            ].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-dark-700 bg-dark-900 px-2 py-0.5 text-xs text-dark-500"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-dark-500">
            <span className="flex items-center gap-1">
              <HardDrive size={11} />
              {model.size}
            </span>

            {model.lastUsed && (
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {model.lastUsed}
              </span>
            )}

            <span className="ml-auto flex items-center gap-1 text-emerald-400">
              <CheckCircle size={11} />
              Ready
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

export const ModelsPage = () => {
  const models = useAppStore(
    (state) => state.models
  );

  const setModels = useAppStore(
    (state) => state.setModels
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadModels = async () => {
    try {
      setLoading(true);
      setError(null);

      const data =
        await apiClient.getModels();

      setModels(data);
    } catch (err) {
      console.error(
        'Failed to load models:',
        err
      );

      setError(
        'Failed to load models. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadModels();
  }, []);

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-bold text-white">
            <Cpu
              size={20}
              className="text-violet-400"
            />
            Models
          </h1>

          <p className="mt-0.5 text-sm text-dark-500">
            {models.length} installed
          </p>
        </div>

        <button
          type="button"
          onClick={loadModels}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-dark-700 bg-dark-800 px-4 py-2 text-sm font-medium text-dark-300 transition-all hover:border-dark-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={
              loading
                ? 'animate-spin'
                : ''
            }
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'Ready',
            count: models.length,
            color:
              'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          },
          {
            label: 'Fast',
            count: models.filter(
              (model) =>
                model.performance ===
                'fast'
            ).length,
            color:
              'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
          },
          {
            label: 'Quality',
            count: models.filter(
              (model) =>
                model.performance ===
                'high-quality'
            ).length,
            color:
              'text-violet-400 bg-violet-500/10 border-violet-500/20',
          },
        ].map(
          ({
            label,
            count,
            color,
          }) => (
            <div
              key={label}
              className={`flex items-center justify-between rounded-xl border p-3 ${color}`}
            >
              <span className="text-xs font-medium">
                {label}
              </span>

              <span className="text-lg font-bold">
                {count}
              </span>
            </div>
          )
        )}
      </div>

      {loading ? (
        <div className="rounded-xl border border-dark-700 bg-dark-800 p-6 text-center text-dark-400">
          Loading models...
        </div>
      ) : models.length === 0 ? (
        <div className="rounded-xl border border-dark-700 bg-dark-800 p-6 text-center text-dark-400">
          No models available
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {models.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
            />
          ))}
        </div>
      )}
    </div>
  );
};