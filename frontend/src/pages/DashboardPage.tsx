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
import { MOCK_IMAGES, MOCK_STATS } from '@/utils';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { prompt, setPrompt } = useGenerationStore();
  const loading = useAppStore((state) => state.loading);
  const recentImages = MOCK_IMAGES.slice(0, 4);
  const maxCount = Math.max(...MOCK_STATS.weeklyData.map((d) => d.count));

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl space-y-8 p-6">
        <section className="relative overflow-hidden rounded-lg border border-dark-700 bg-dark-800 p-8">
          <div className="pointer-events-none absolute inset-0 bg-glow-gradient" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
                <span className="text-xs font-medium text-success">All systems ready</span>
              </div>
              <h1 className="mb-1 text-2xl font-bold text-heading">
                Create something <span className="text-gradient">extraordnary</span>
              </h1>
              <p className="text-sm text-soft">Your AI image studio is ready. What will you generate today?</p>
            </div>
            <button onClick={() => navigate('/generate')} className="btn-plasma gap-2 px-6 py-3 text-base">
              <Zap size={18} fill="white" />
              Start Generating
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Images} label="Total generated" value={MOCK_STATS.totalGenerated.toLocaleString()} sub="+34 today" accent />
          <StatCard icon={Sparkles} label="Models available" value={MOCK_STATS.modelsAvailable} />
          <StatCard icon={Star} label="Favorites saved" value={MOCK_STATS.totalFavorites} />
          <StatCard icon={Clock} label="Avg gen time" value={`${MOCK_STATS.avgGenerationTime}s`} />
        </section> */}

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="card p-6 lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-heading">Weekly Activity</h2>
                <p className="mt-0.5 text-xs text-faint">Images generated per day</p>
              </div>
              <span className="badge bg-success/15 text-xs text-success">
                <TrendingUp size={11} /> +12% this week
              </span>
            </div>
            <div className="flex h-28 items-end gap-2">
              {MOCK_STATS.weeklyData.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                  <span className="font-mono text-[10px] text-faint">{d.count}</span>
                  <div
                    className="w-full rounded-t-lg bg-plasma/40 transition-colors hover:bg-plasma"
                    style={{ height: `${(d.count / maxCount) * 80}%`, minHeight: 4 }}
                  />
                  <span className="text-[10px] text-faint">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card flex flex-col p-5">
            <h2 className="mb-1 text-sm font-semibold text-heading">Quick Generate</h2>
            <p className="mb-4 text-xs text-faint">Jump right in with a prompt</p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A vibrant sunset over a futuristic city..."
              rows={4}
              className="input-base mb-3 flex-1 resize-none text-sm"
            />
            <button onClick={() => navigate('/generate')} className="btn-plasma w-full justify-center gap-2" disabled={loading}>
              <Sparkles size={15} />
              Generate
            </button>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-heading">Recent Generations</h2>
              <p className="mt-0.5 text-xs text-faint">Your latest creations</p>
            </div>
            <button onClick={() => navigate('/gallery')} className="btn-ghost gap-1 text-xs">
              View all <ArrowRight size={13} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {recentImages.map((img) => (
              <ImageCard key={img.id} image={img} />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-heading">Available Models</h2>
            <button onClick={() => navigate('/models')} className="btn-ghost gap-1 text-xs">
              Manage <ArrowRight size={13} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {[
              { name: 'flux Schnell', desc: 'Fast, high quality' },
              { name: 'flux', desc: 'Flagship model' },
              { name: 'Stable Diffusion XL', desc: 'Versatile and artistic' },
            ].map((model) => (
              <div key={model.name} className="card flex items-center gap-3 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-plasma/15">
                  <Cpu size={16} className="text-plasma-light" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-heading">{model.name}</p>
                  <p className="text-xs text-faint">{model.desc}</p>
                </div>
                <div className="ml-auto h-2 w-2 shrink-0 rounded-full bg-success" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
