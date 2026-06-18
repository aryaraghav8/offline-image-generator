import { useEffect, useState } from 'react';
import { Database, HardDrive, Trash2 } from 'lucide-react';
import { AdminPageHeader, AdminPanel, AdminProgressBar, Toggle } from '@/admin/components/AdminPrimitives';
import { Skeleton } from '@/components/ui/AdvancedComponents';
import { Button, Select } from '@/components/ui/BaseComponents';
import { useAppStore } from '@/stores/appStore';
import { fetchStorageOverview, runCleanupNow, updateRetentionPolicy } from '@/admin/services/adminApi';
import type { StorageOverview } from '@/admin/types';
import { formatDateTime, formatFileSize } from '@/utils';

const RETENTION_OPTIONS = [
  { value: '30', label: '30 days' },
  { value: '60', label: '60 days' },
  { value: '90', label: '90 days' },
  { value: '180', label: '180 days' },
  { value: '0', label: 'Forever' },
];

export const AdminStoragePage = () => {
  const [data, setData] = useState<StorageOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const addToast = useAppStore((s) => s.addToast);

  useEffect(() => {
    fetchStorageOverview().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const handleRetentionChange = async (days: number) => {
    if (!data) return;
    const updated = await updateRetentionPolicy(days, data.autoCleanupEnabled);
    setData(updated);
    addToast('Retention policy updated', 'success');
  };

  const handleAutoCleanupToggle = async (enabled: boolean) => {
    if (!data) return;
    const updated = await updateRetentionPolicy(data.retentionDays, enabled);
    setData(updated);
  };

  const handleCleanupNow = async () => {
    setCleaning(true);
    const updated = await runCleanupNow();
    setData(updated);
    addToast('Cleanup complete', 'success');
    setCleaning(false);
  };

  if (loading || !data) {
    return (
      <>
        <AdminPageHeader title="Storage" description="Disk usage and retention policy." />
        <Skeleton className="h-64" />
      </>
    );
  }

  const usagePct = (data.usedBytes / data.totalCapacityBytes) * 100;

  return (
    <>
      <AdminPageHeader
        title="Storage"
        description="Monitor disk usage across generated images, model weights, and logs."
        actions={
          <Button variant="secondary" size="sm" isLoading={cleaning} onClick={handleCleanupNow}>
            <Trash2 size={14} />
            Run cleanup now
          </Button>
        }
      />

      <AdminPanel>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-dark-300">
            <HardDrive size={16} className="text-dark-500" />
            <span className="font-medium text-white">{formatFileSize(data.usedBytes)}</span>
            <span className="text-dark-500">used of {formatFileSize(data.totalCapacityBytes)}</span>
          </div>
          <span className="text-sm text-dark-500">{usagePct.toFixed(1)}%</span>
        </div>
        <AdminProgressBar value={usagePct} className="mt-3" tone={usagePct > 80 ? 'warning' : 'ember'} />
      </AdminPanel>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.buckets.map((bucket) => {
          const pct = (bucket.usedBytes / data.usedBytes) * 100;
          return (
            <div key={bucket.id} className="rounded-xl border border-dark-700 bg-dark-900/60 p-4">
              <div className="flex items-center gap-2">
                <Database size={14} className="text-dark-500" />
                <p className="text-sm font-medium text-white">{bucket.label}</p>
              </div>
              <p className="mt-2 text-xl font-semibold text-white">{formatFileSize(bucket.usedBytes)}</p>
              <p className="text-xs text-dark-500">{bucket.fileCount.toLocaleString()} files · {bucket.path}</p>
              <AdminProgressBar value={pct} className="mt-3" />
            </div>
          );
        })}
      </div>

      <AdminPanel title="Retention policy" description="Automatically remove generated images older than the selected window.">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-end gap-3">
            <Select
              label="Delete generated images after"
              value={String(data.retentionDays)}
              onChange={(e) => handleRetentionChange(Number(e.target.value))}
              options={RETENTION_OPTIONS}
            />
            <Toggle
              checked={data.autoCleanupEnabled}
              onChange={handleAutoCleanupToggle}
              label="Run automatically"
            />
          </div>
          <p className="text-xs text-dark-500">
            Last cleanup: {data.lastCleanupAt ? formatDateTime(data.lastCleanupAt) : 'Never'}
          </p>
        </div>
      </AdminPanel>
    </>
  );
};
