import { useEffect, useState } from 'react';
import { AlertTriangle, Clock, Cpu, Image as ImageIcon, Plug, TrendingUp } from 'lucide-react';
import { AdminPageHeader, AdminStatCard, AdminPanel } from '@/admin/components/AdminPrimitives';
import { Skeleton } from '@/components/ui/AdvancedComponents';
import { fetchAdminDashboard } from '@/admin/services/adminApi';
import type { AdminDashboardOverview } from '@/admin/types';

export const AdminDashboardPage = () => {
  const [data, setData] = useState<AdminDashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchAdminDashboard().then((res) => {
      if (active) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const maxTrend = data ? Math.max(...data.generationsTrend.map((p) => p.value)) : 1;

  return (
    <>
      <AdminPageHeader title="Dashboard" description="A real-time snapshot of generation activity and platform health." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading || !data ? (
          <Skeleton className="h-24" count={6} />
        ) : (
          <>
            <AdminStatCard label="Generations today" value={data.totalGenerationsToday.toLocaleString()} icon={<ImageIcon size={16} />} hint={`${data.totalGenerationsAllTime.toLocaleString()} all time`} />
            <AdminStatCard label="Active models" value={data.activeModels} icon={<Cpu size={16} />} hint="Visible to end users" />
            <AdminStatCard label="Connected providers" value={data.connectedProviders} icon={<Plug size={16} />} hint="Of 4 configured" />
            <AdminStatCard label="Failure rate (24h)" value={`${data.failureRate24h}%`} icon={<AlertTriangle size={16} />} trend={{ value: '0.3%', positive: false }} />
            <AdminStatCard label="Avg generation time" value={`${data.avgGenerationTimeSec}s`} icon={<Clock size={16} />} hint="Across all models" />
            <AdminStatCard label="Weekly volume" value={data.generationsTrend.reduce((s, p) => s + p.value, 0).toLocaleString()} icon={<TrendingUp size={16} />} trend={{ value: '12%', positive: true }} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AdminPanel title="Generations this week" className="lg:col-span-2">
          {loading || !data ? (
            <Skeleton className="h-48" />
          ) : (
            <div className="flex h-48 items-end gap-3">
              {data.generationsTrend.map((point) => (
                <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-36 w-full items-end">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-ember-600 to-ember-400 transition-all"
                      style={{ height: `${(point.value / maxTrend) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-dark-500">{point.label}</span>
                </div>
              ))}
            </div>
          )}
        </AdminPanel>

        <AdminPanel title="Recent activity">
          {loading || !data ? (
            <Skeleton className="h-10" count={5} />
          ) : (
            <ul className="space-y-4">
              {data.recentActivity.map((item) => (
                <li key={item.id} className="flex gap-3 text-sm">
                  <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ember-500" />
                  <p className="text-dark-300">
                    <span className="font-medium text-white">{item.actor}</span>{' '}
                    {item.action} <span className="font-medium text-white">{item.target}</span>
                    <span className="block text-xs text-dark-500">{item.timestamp}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>
    </>
  );
};
