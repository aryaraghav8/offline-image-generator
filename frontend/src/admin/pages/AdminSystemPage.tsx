import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Cpu, Info, MemoryStick, RotateCw, XCircle } from 'lucide-react';
import { AdminPageHeader, AdminPanel, AdminProgressBar, StatusPill } from '@/admin/components/AdminPrimitives';
import { Skeleton } from '@/components/ui/AdvancedComponents';
import { Button } from '@/components/ui/BaseComponents';
import { useAppStore } from '@/stores/appStore';
import { fetchSystemOverview, restartService } from '@/admin/services/adminApi';
import type { ServiceState, SystemLogEntry, SystemOverview } from '@/admin/types';
import { formatDateTime } from '@/utils';

const SERVICE_TONE: Record<ServiceState, 'success' | 'warning' | 'error'> = {
  healthy: 'success',
  degraded: 'warning',
  down: 'error',
};

const LOG_ICON: Record<SystemLogEntry['level'], React.ReactNode> = {
  info: <Info size={14} className="text-sky-400" />,
  warning: <AlertCircle size={14} className="text-amber-400" />,
  error: <XCircle size={14} className="text-rose-400" />,
};

export const AdminSystemPage = () => {
  const [data, setData] = useState<SystemOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [restartingId, setRestartingId] = useState<string | null>(null);
  const addToast = useAppStore((s) => s.addToast);

  useEffect(() => {
    fetchSystemOverview().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const handleRestart = async (id: string, name: string) => {
    setRestartingId(id);
    const updated = await restartService(id);
    setData(updated);
    addToast(`${name} restarted`, 'success');
    setRestartingId(null);
  };

  if (loading || !data) {
    return (
      <>
        <AdminPageHeader title="System" description="Service health, resource usage, and logs." />
        <Skeleton className="h-64" />
      </>
    );
  }

  return (
    <>
      <AdminPageHeader title="System" description="Service health, resource usage, and recent logs." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {data.services.map((service) => (
          <AdminPanel key={service.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {service.state === 'healthy' ? (
                    <CheckCircle2 size={15} className="text-emerald-400" />
                  ) : (
                    <AlertCircle size={15} className={service.state === 'degraded' ? 'text-amber-400' : 'text-rose-400'} />
                  )}
                  <h3 className="font-medium text-white">{service.name}</h3>
                </div>
                <p className="mt-1 text-xs text-dark-500">{service.description}</p>
              </div>
              <StatusPill tone={SERVICE_TONE[service.state]}>{service.state}</StatusPill>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-dark-500">
              <span>Uptime {service.uptime} · v{service.version}</span>
              {service.state !== 'healthy' && (
                <Button
                  variant="ghost"
                  size="sm"
                  isLoading={restartingId === service.id}
                  onClick={() => handleRestart(service.id, service.name)}
                >
                  <RotateCw size={13} />
                  Restart
                </Button>
              )}
            </div>
          </AdminPanel>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminPanel>
          <div className="flex items-center gap-2 text-sm text-dark-400">
            <Cpu size={15} /> CPU usage
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">{data.cpuUsage}%</p>
          <AdminProgressBar value={data.cpuUsage} className="mt-3" tone={data.cpuUsage > 80 ? 'warning' : 'ember'} />
        </AdminPanel>
        <AdminPanel>
          <div className="flex items-center gap-2 text-sm text-dark-400">
            <MemoryStick size={15} /> Memory usage
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">
            {data.memoryUsage}% <span className="text-sm font-normal text-dark-500">of {data.memoryTotalGb} GB</span>
          </p>
          <AdminProgressBar value={data.memoryUsage} className="mt-3" tone={data.memoryUsage > 80 ? 'warning' : 'ember'} />
        </AdminPanel>
        <AdminPanel>
          <div className="flex items-center gap-2 text-sm text-dark-400">
            <Cpu size={15} /> GPU usage
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">{data.gpuUsage !== null ? `${data.gpuUsage}%` : '—'}</p>
          {data.gpuUsage !== null && <AdminProgressBar value={data.gpuUsage} className="mt-3" />}
        </AdminPanel>
      </div>

      <AdminPanel title="Recent logs" noPadding>
        <ul className="divide-y divide-dark-800">
          {data.logs.map((log) => (
            <li key={log.id} className="flex items-start gap-3 px-5 py-3">
              <span className="mt-0.5">{LOG_ICON[log.level]}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-dark-200">{log.message}</p>
                <p className="mt-0.5 text-xs text-dark-500">
                  {log.source} · {formatDateTime(log.timestamp)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </AdminPanel>
    </>
  );
};
