import { useEffect } from 'react';
import {
  ArrowRight,
  Cpu,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { ImageCard } from '@/components/gallery/ImageCard';

import { useAppStore } from '@/stores/appStore';
import { useGenerationStore } from '@/stores/generationStore';

import { apiClient } from '@/services/api';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { prompt, setPrompt } = useGenerationStore();
  const loading = useAppStore((state) => state.loading);
  const models = useAppStore((state) => state.models);
  const setModels = useAppStore((state) => state.setModels);
  const generations = useHistoryStore((state) =>state.generations);
  const setGenerations = useHistoryStore( (state) => state.setGenerations);

  useEffect(() => {
    const loadDashboardData =
      async () => {
        try {
          const [
            modelsData,
            historyData,
          ] =
            await Promise.all([
              apiClient.getModels(),

              apiClient.getGenerationHistory(),
            ]);

          setModels(modelsData);

          setGenerations(
            historyData.items
          );
        } catch (error) {
          console.error(
            'Dashboard load failed:',
            error
          );
        }
      };

    void loadDashboardData();
  }, [
    setModels,
    setGenerations,
  ]);

  const recentImages =
    generations
      .flatMap(
        (generation) =>
          generation.images
      )
      .slice(0, 4);

  const weeklyData = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
  ].map((day) => ({
    day,

    count:
      generations.filter(
        (
          generation
        ) => {
          const created =
            new Date(
              generation.createdAt
            );

          return (
            created.toLocaleDateString(
              'en-US',
              {
                weekday:
                  'short',
              }
            ) === day
          );
        }
      ).length,
  }));

  const maxCount =
    Math.max(
      ...weeklyData.map(
        (d) => d.count
      ),
      1
    );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl space-y-8 p-6">
        <section className="relative overflow-hidden rounded-lg border border-dark-700 bg-dark-800 p-8">
          <div className="pointer-events-none absolute inset-0 bg-glow-gradient" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-success" />

                <span className="text-xs font-medium text-success">
                  All systems ready
                </span>
              </div>

              <h1 className="mb-1 text-2xl font-bold text-heading">
                Create something{' '}
                <span className="text-gradient">
                  extraordinary
                </span>
              </h1>

              <p className="text-sm text-soft">
                Your AI image studio
                is ready.
              </p>
            </div>

            <button
              onClick={() =>
                navigate(
                  '/generate'
                )
              }
              className="btn-plasma gap-2 px-6 py-3 text-base"
            >
              <Zap
                size={18}
                fill="white"
              />

              Start Generating

              <ArrowRight
                size={16}
              />
            </button>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="card p-6 lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-heading">
                  Weekly Activity
                </h2>

                <p className="mt-0.5 text-xs text-faint">
                  Images generated
                  per day
                </p>
              </div>

              <span className="badge bg-success/15 text-xs text-success">
                <TrendingUp
                  size={11}
                />
                Active
              </span>
            </div>

            <div className="flex h-28 items-end gap-2">
              {weeklyData.map(
                (d) => (
                  <div
                    key={
                      d.day
                    }
                    className="flex flex-1 flex-col items-center gap-1"
                  >
                    <span className="font-mono text-[10px] text-faint">
                      {
                        d.count
                      }
                    </span>

                    <div
                      className="w-full rounded-t-lg bg-plasma/40 hover:bg-plasma"
                      style={{
                        height: `${(d.count / maxCount) * 80}%`,
                        minHeight: 4,
                      }}
                    />

                    <span className="text-[10px] text-faint">
                      {
                        d.day
                      }
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="card flex flex-col p-5">
            <h2 className="mb-1 text-sm font-semibold text-heading">
              Quick Generate
            </h2>

            <textarea
              value={prompt}
              onChange={(
                e
              ) =>
                setPrompt(
                  e.target
                    .value
                )
              }
              rows={4}
              className="input-base mb-3 flex-1 resize-none"
            />

            <button
              onClick={() =>
                navigate(
                  '/generate'
                )
              }
              disabled={
                loading
              }
              className="btn-plasma"
            >
              <Sparkles
                size={15}
              />

              Generate
            </button>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold text-heading">
            Available Models
          </h2>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {models.map(
              (
                model
              ) => (
                <div
                  key={
                    model.id
                  }
                  className="card flex items-center gap-3 p-4"
                >
                  <Cpu
                    size={
                      16
                    }
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-heading">
                      {
                        model.displayName
                      }
                    </p>

                    <p className="text-xs text-faint">
                      {model.description}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        <section>
          {recentImages.length > 0 ? (
            <ImageCard image={recentImages[0]} />
          ) : (
            <div className="rounded-lg border border-dark-700 p-8 text-center text-faint">
              No generations yet
            </div>
          )}
        </section>
      </div>
    </div>
  );
};